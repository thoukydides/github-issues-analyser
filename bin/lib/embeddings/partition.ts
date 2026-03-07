// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { CandidateFAQ } from '../data/candidates.js';
import { assertIsDefined, formatList, plural } from '../utils.js';
import skmeans from 'skmeans';
import { GeminiEmbeddingType } from './google-ai-studio.js';

// Embedding type to use
const EMBEDDING_TYPE: GeminiEmbeddingType = 'clustering';

// Select a maximum number of related FAQ candidates
export function selectRelatedCandidates<T extends { id: string }>(
    allCandidates:  Map<string, CandidateFAQ>,
    candidates:     T[],
    limit:          number
): T[] {
    // Convert the candidates to the required format for processing
    const entries = candidates.map(candidate =>
        ({ candidate, vector: allCandidates.get(candidate.id)?.embeddings[EMBEDDING_TYPE] ?? [] }));

    // Partition the candidates
    const partitions = clusterPartitions(entries, limit);

    // Return the largest partition (or an empty list if none)
    const maxLength = Math.max(...partitions.map(p => p.length));
    const partition = partitions.find(p => p.length === maxLength) ?? [];
    if (candidates.length && !partition.length) throw new Error('No candidates selected');
    if (partition.length < candidates.length) {
        core.info(`Selected ${partition.length} of ${plural(candidates.length, 'candidate entry')}`);
    }
    return partition.map(p => p.candidate);
}

// Attempt to use semantic clusters to partition under a size limit
function clusterPartitions<T extends { vector: number[] }>(entries: T[], limit: number): T[][] {
    if (entries.length <= limit) return [entries];

    // Target the clusters to be roughly the right size
    const k = Math.ceil(entries.length / limit);
    const data = entries.map(e => e.vector);
    const { idxs } = skmeans(data, k, 'kmpp');

    // Map back to the original entries (sparse array if any clusters empty)
    const partialPartitions: T[][] = [];
    idxs.forEach((clusterIndex, dataIndex) => {
        const entry = entries[dataIndex];
        assertIsDefined(entry);
        (partialPartitions[clusterIndex] ??= []).push(entry);
    });
    core.info(`Clustered ${plural(entries.length, 'entry')} into ${k} partitions`
        + ` (${formatList(partialPartitions.map(p => p.length.toString()))})`);

    // Recursively cluster any partitions that are still too large
    const fullPartitions = partialPartitions.flatMap(p => clusterPartitions(p, limit));

    // Merge any small partitions that would still be under the limit
    return mergePartitions(fullPartitions, limit);
}

// Merge any small partitions that would still be under the limit
function mergePartitions<T>(partitions: T[][], limit: number): T[][] {
    // Order the partitions by descending length
    const sorted = partitions.toSorted((a, b) => b.length - a.length);

    // Greedily merge partitions (not worth a full knapsack solution)
    const merged: T[][] = [];
    for (const partition of sorted) {
        const index = merged.findIndex(p => (p.length + partition.length) <= limit);
        const existing = merged[index];
        if (existing)   merged[index] = existing.concat(partition);
        else            merged.push(partition);
    }
    return merged;
}