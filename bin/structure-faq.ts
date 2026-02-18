// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import HDBSCAN, { cosine, VectorPoint } from 'clusternova';
import { CandidateFAQ, loadCandidatesMap } from './lib/data/candidates.js';
import { assertIsDefined, formatList, plural } from './lib/utils.js';
import { CONFIG, ConfigRepository } from './config.js';
import { loadMarkdownFAQ, saveMarkdownFAQ } from './lib/data/faq.js';
import { saveStructuredFAQ, StructuredFAQ, StructuredFAQCandidate,
         StructuredFAQCategory, StructuredFAQExisting, StructuredFAQPartition } from './lib/data/structure.js';
import { Embedding, embeddingsStats, euclideanDistance, minEuclideanDistance } from './lib/embeddings/clustering.js';
import { GeminiEmbeddingType } from './lib/embeddings/google-ai-studio.js';

// Embedding type to use
const EMBEDDING_TYPE: GeminiEmbeddingType = 'clustering';

// Cluster size relative to all-members centroid distance statistics
const CLUSTER_RADIUS_SD = 1; // mean + 1 * stdev

// Partition size to attempt splitting into sub-clusters
const MIN_PARTITION_SIZE = 10; // Minimum size to attempt sub-clustering
const MAX_PARTITION_SIZE = 25; // Limit to this maximum size

try {
    run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
function run(): void {
    // Structure the FAQ for each configured repository
    for (const repo of CONFIG) {
        structureFAQ(repo);
    }
}

// Structure the FAQ for a single repository
function structureFAQ(repo: ConfigRepository): void {
    // Load the current FAQ and all candidate entries
    const faq = loadMarkdownFAQ(repo);
    const allCandidates = loadCandidatesMap(repo);

    // Assign new candidates to clusters
    const newCandidates = filterIdentifiers(allCandidates, faq);
    addCandidatesToClusters(allCandidates, newCandidates, faq);

    // Divide any clusters that are too large
    splitLargeClusters(allCandidates, faq);

    // Save the FAQ with the new candidates integrated
    saveStructuredFAQ(repo, faq);
    saveMarkdownFAQ(repo, faq);
}

// Remove any unknown IDs from the FAQ (mutate in place) and return new candidates
function filterIdentifiers(candidates: Map<string, CandidateFAQ>, faq: StructuredFAQ): CandidateFAQ[] {
    // Remove any unknown IDs from the FAQ
    const faqIds = new Set<string>();
    const filterFaqIds = (ids: string[]): string[] => {
        for (const id of ids) faqIds.add(id);
        return ids.filter(id => candidates.has(id));
    };
    const filterCategoryIds = (category: StructuredFAQCategory): void => {
        for (const partition of category.partitions) {
            for (const entry of partition.entries) {
                entry.included_ids = filterFaqIds(entry.included_ids);
            }
        }
        for (const subcategory of category.subcategories) filterCategoryIds(subcategory);
    };
    faq.excluded_ids = filterFaqIds(faq.excluded_ids);
    filterCategoryIds(faq);

    // Warn about any IDs referenced in the FAQ that no longer exist
    const unknownIds = [...faqIds].filter(id => !candidates.has(id)).sort();
    if (unknownIds.length) {
        core.warning(formatList(unknownIds), { title: `Ignoring ${plural(unknownIds.length, 'unknown identifier')}` });
    }

    // Identify candidate entries that are not already referenced in the FAQ
    const newCandidates = [...candidates.entries()]
        .filter(([id]) => !faqIds.has(id))
        .map(([, candidate]) => candidate);
    core.info(`Found ${plural(newCandidates.length, 'new candidate entry')}`);
    return newCandidates;
}

// Add candidate entries to clusters (mutate in place)
function addCandidatesToClusters(allCandidates: Map<string, CandidateFAQ>, newCandidates: CandidateFAQ[], faq: StructuredFAQ): void {
    // Convert categories and partitions to flat clusters
    interface Cluster {
        category:       StructuredFAQCategory;
        partition:      StructuredFAQPartition;
        embeddings:     Embedding[];
        centroid:       Embedding;
        radius:         number;
    }
    const makeClusters = (category: StructuredFAQCategory): Cluster[] => {
        const partitionClusters = category.partitions.map(partition => {
            const ids = partition.entries.flatMap(e => e.included_ids);
            const embeddings = getEmbeddingsForIds(allCandidates, ids);
            const { centroid, distance } = embeddingsStats(embeddings);
            const radius = distance.mean + distance.sd * CLUSTER_RADIUS_SD;
            const cluster: Cluster = { category, partition, embeddings, centroid, radius };
            return cluster;
        });
        const subcategoryClusters = category.subcategories.flatMap(subcategory => makeClusters(subcategory));
        return [...partitionClusters, ...subcategoryClusters];
    };
    const clusters = makeClusters(faq);

    // Map candidates to existing clusters based on similarity
    const outliers: StructuredFAQCandidate[] = [];
    for (const candidate of newCandidates) {
        // Identify the clusters that this may be part of
        const candidateEmbedding = candidate.embeddings[EMBEDDING_TYPE];
        const candidateClusters = clusters.filter(c =>
            euclideanDistance(candidateEmbedding, c.centroid) <= c.radius);

        // Use nearest neighbour to select between multiple candidate clusters
        const distances = candidateClusters.map(c => minEuclideanDistance(candidateEmbedding, c.embeddings));
        const cluster = candidateClusters[distances.indexOf(Math.min(...distances))];

        // Add the candidate to the selected cluster, or to the list of outliers
        const { question, answer, issue_number, id } = candidate;
        const faqCandidate: StructuredFAQCandidate = { question, answer, issue_number, id };
        (cluster?.partition.candidates ?? outliers).push(faqCandidate);
    }
    const clustered = newCandidates.length - outliers.length;
    core.info(`Assigned ${plural(clustered, 'candidate entry')} to existing partitions`);

    // Create a new category for any outliers
    if (outliers.length) {
        core.info(`Creating new category for ${plural(outliers.length, 'new candidate entry')}`);
        const category: StructuredFAQCategory = {
            heading:        'New category',
            preamble:       '',
            partitions:     [{ entries: [], candidates: outliers }],
            subcategories:  []
        };
        faq.subcategories.push(category);
    }
}

// Split excessively larger clusters (mutate in place)
function splitLargeClusters(allCandidates: Map<string, CandidateFAQ>, faq: StructuredFAQ): void {
    const partitionSize = (partition: StructuredFAQPartition): number =>
        partition.entries.length + partition.candidates.length;
    const clusterPartition = (partition: StructuredFAQPartition): StructuredFAQPartition[] => {
        // Convert the partition entries to a format suitable for clustering
        interface Entry extends VectorPoint { entry: StructuredFAQExisting | StructuredFAQCandidate; }
        const data: Entry[] = [
            ...partition.entries.map((entry, index) => ({
                id:     `entry-${index.toString()}`,
                vector: embeddingsStats(getEmbeddingsForIds(allCandidates, entry.included_ids)).centroid,
                entry
            })),
            ...partition.candidates.map(entry => ({
                id:     entry.id,
                vector: allCandidates.get(entry.id)?.embeddings[EMBEDDING_TYPE] ?? [],
                entry
            }))
        ];

        // Attempt to find clusters within this partition
        const hdbscan = new HDBSCAN.default(data, MIN_PARTITION_SIZE, cosine);
        const { clusters, outliers } = hdbscan.run();

        // No change if a single cluster (or no clustering possible)
        if (clusters.length + (outliers.length ? 1 : 0) < 2) return [partition];

        // Convert each cluster to a partition
        return [outliers, ...clusters].map((c, i) => {
            return {
                partition:  `${partition.partition ?? 'New partition'} ${i || 'outliers'}`,
                entries:    c.filter(c =>  c.id.startsWith('entry-')).map(c => c.entry) as StructuredFAQExisting[],
                candidates: c.filter(c => !c.id.startsWith('entry-')).map(c => c.entry) as StructuredFAQCandidate[]
            } satisfies StructuredFAQPartition;
        });
    };
    const splitLargePartition = (partition: StructuredFAQPartition): StructuredFAQPartition[] => {
        const partitionCount    = Math.ceil(partitionSize(partition) / MAX_PARTITION_SIZE);
        const entriesSlice      = Math.ceil(partition.entries.length    / partitionCount);
        const candidatesSlice   = Math.ceil(partition.candidates.length / partitionCount);
        const partitions: StructuredFAQPartition[] = [];
        for (let i = 0; i < partitionCount; ++i) {
            partitions.push({
                partition:  `${partition.partition ?? 'New partition'} ${i + 1}`,
                entries:    partition.entries   .slice(i * entriesSlice,    (i + 1) * entriesSlice),
                candidates: partition.candidates.slice(i * candidatesSlice, (i + 1) * candidatesSlice)
            } satisfies StructuredFAQPartition);
        }
        return partitions;
    };

    // Check the size of all partitions
    const checkCategorySize = (category: StructuredFAQCategory): void => {
        // Subdivide any partition that is too large
        const solePartition = category.partitions.length === 1 && !category.subcategories.length;
        const thresholdSize = solePartition ? MIN_PARTITION_SIZE : MAX_PARTITION_SIZE;
        category.partitions = category.partitions
            .flatMap(p => thresholdSize      < partitionSize(p) ? clusterPartition(p)    : p)
            .flatMap(p => MAX_PARTITION_SIZE < partitionSize(p) ? splitLargePartition(p) : p);

        // If a sole partition has been split then promote to subcategories
        if (solePartition && 1 < category.partitions.length) {
            for (const partition of category.partitions) {
                category.subcategories.push({
                    heading:        partition.partition ?? 'New sub-category',
                    preamble:       '',
                    partitions:     [partition],
                    subcategories:  []
                });
            }
            category.partitions = [];
        }

        // Recurse into subcategories (including any newly created ones)
        for (const subcategory of category.subcategories) checkCategorySize(subcategory);
    };
    checkCategorySize(faq);
}

// Embeddings for a list of candidate IDs
function getEmbeddingsForIds(candidates: Map<string, CandidateFAQ>, ids: string[]): Embedding[] {
    const uniqueIds = [...new Set(ids)];
    return uniqueIds.map(id => {
        const candidate = candidates.get(id);
        assertIsDefined(candidate);
        return candidate.embeddings[EMBEDDING_TYPE];
    });
}