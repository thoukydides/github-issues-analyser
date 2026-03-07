// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { CandidateFAQ, loadCandidatesMap } from './lib/data/candidates.js';
import { formatList, plural } from './lib/utils.js';
import { CONFIG, ConfigRepository } from './config.js';
import { loadMarkdownFAQ, saveMarkdownFAQ } from './lib/data/faq.js';
import { loadStructuredFAQ, saveStructuredFAQ, StructuredFAQ, StructuredFAQCandidate,
         StructuredFAQCategory, StructuredFAQPartition } from './lib/data/structure.js';
import { makeStableHash } from './lib/hash.js';
import { FaqStructureSchema } from './lib/prompts/faq-structure.js';
import { geminiInference } from './lib/inference/google-ai-studio.js';
import { selectRelatedCandidates } from './lib/embeddings/partition.js';

// Prompt file
const PROMPT_FILE = './faq-structure.prompt.yml';

// Maximum number of candidates to process in a single inference request
const MAX_CANDIDATES = 50;

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    // Structure the FAQ for each configured repository
    let performedInference = false;
    for (const repo of CONFIG) {
        core.info(`\n${repo.owner}/${repo.repo}:`);
        performedInference = await structureFAQ(repo, performedInference);
    }
    if (!performedInference) core.notice('All FAQs up-to-date; nothing to do');
}

// Structure the FAQ for a single repository
async function structureFAQ(repo: ConfigRepository, performedInference: boolean): Promise<boolean> {
    // Load the FAQ and all candidate entries
    const faq = loadFAQ(repo);
    const allCandidates = loadCandidatesMap(repo);

    // HERE - Remove unreferenced IDs
    removeUnreferencedIds(faq, allCandidates);

    // Identify new candidate entries
    const newCandidates = getNewCandidates(faq, allCandidates);
    if (newCandidates.length === 0) {
        core.info('No new candidate entries');
    } else if (performedInference) {
        core.warning(`${plural(newCandidates.length, 'new candidate entry')} unprocessed`);
    } else {
        // Limit the maximum number of candidates processed per inference
        const candidates = selectRelatedCandidates(allCandidates, newCandidates, MAX_CANDIDATES);

        // Perform AI inference
        const existing = faqToModel(faq);
        const vars = new Map<string, string>([
            ['owner',       repo.owner],
            ['repository',  repo.repo],
            ['existing',    JSON.stringify(existing.faq)],
            ['candidates',  JSON.stringify(candidatesToModel(candidates))]
        ]);
        const response = await geminiInference(PROMPT_FILE, vars, FaqStructureSchema);
        performedInference = true;

        // Integrate the updated entries
        modelToFaq(faq, existing.map, candidates, response);
        const unprocessed = newCandidates.length - candidates.length;
        if (unprocessed) core.warning(`${plural(unprocessed, 'candidate entry')} unprocessed`);
    }

    // HERE - Divide any partitions that are too large

    // Save the FAQ (in both structured and Markdown formats)
    saveStructuredFAQ(repo, faq);
    saveMarkdownFAQ(repo, faq);
    return performedInference;
}

// Load the current structured FAQ, rebuilding from the markdown FAQ if changed
function loadFAQ(repo: ConfigRepository): StructuredFAQ {
    const faq = loadMarkdownFAQ(repo);
    faq.source_hashes = { faq: makeStableHash(faq) };
    const structured = loadStructuredFAQ(repo);
    if (structured && structured.source_hashes?.faq === faq.source_hashes.faq) {
        core.info('FAQ unchanged; using existing structured FAQ');
        return structured;
    } else {
        core.info('Rebuilding structured FAQ');
        return faq;
    }
}

// Remove unreferenced IDs from the FAQ (mutate in place)
function removeUnreferencedIds(faq: StructuredFAQ, allCandidates: Map<string, CandidateFAQ>): void {
    const filterIds = (ids: string[]): string[] => ids.filter(id => allCandidates.has(id));
    const removeUnreferenced = (category: StructuredFAQCategory): void => {
        for (const partition of category.partitions) {
            for (const entry of partition.entries) {
                entry.included_ids = filterIds(entry.included_ids);
            }
        }
        for (const subcategory of category.subcategories) removeUnreferenced(subcategory);
    };
    faq.excluded_ids = filterIds(faq.excluded_ids);
    removeUnreferenced(faq);
}

// Identify new candidate entries
function getNewCandidates(faq: StructuredFAQ, allCandidates: Map<string, CandidateFAQ>): CandidateFAQ[] {
    const existingIds = getAllIdentifiers(faq);
    const newCandidates = [...allCandidates.values()].filter(candidate => !existingIds.has(candidate.id));
    core.info(`Found ${plural(newCandidates.length, 'new candidate entry')}`);
    return newCandidates;
}

// Get all referenced candidate identifiers (entries, candidates, and excluded)
function getAllIdentifiers(faq: StructuredFAQ): Set<string> {
    const ids = new Set<string>(faq.excluded_ids);
    const collectIds = (category: StructuredFAQCategory): void => {
        for (const partition of category.partitions) {
            for (const entry of partition.entries) for (const id of entry.included_ids) ids.add(id);
            for (const candidate of partition.candidates) ids.add(candidate.id);
        }
        for (const subcategory of category.subcategories) collectIds(subcategory);
    };
    collectIds(faq);
    return ids;
}

// Convert FAQ structure to model's input context
type FaqIdMap = Map<string, { parent: StructuredFAQCategory, leaf?: StructuredFAQPartition }>;
function faqToModel(faq: StructuredFAQ): { faq: unknown, map: FaqIdMap } {
    const map: FaqIdMap = new Map();
    const makeId = (prefix: string, parent: StructuredFAQCategory, leaf?: StructuredFAQPartition): string => {
        const id = `${prefix}-${makeStableHash(map.size).substring(0, 8)}`;
        if (map.has(id)) throw new Error(`ID hash collision: ${id}`); // (first collision is at 78,682)
        map.set(id, { parent, leaf });
        return id;
    };
    const partitionToModel = (category: StructuredFAQCategory, partition: StructuredFAQPartition): unknown => {
        const leaf_id = makeId('leaf', category, partition);
        const entries = partition.entries.length ? partition.entries : partition.candidates;
        const questions = entries.map(e => e.question);
        const heading = partition.partition ?? '(Untitled)';
        return { leaf_id, heading, questions };
    };
    const categoryToModel = (category: StructuredFAQCategory): unknown => {
        const { heading, partitions, subcategories } = category;
        const parent_id = makeId('parent', category);
        const subcategoriesAndPartitions = [
            ...partitions.map(partition => partitionToModel(category, partition)),
            ...subcategories.map(subcategory => categoryToModel(subcategory))
        ];
        return { parent_id, heading, subcategories: subcategoriesAndPartitions };
    };
    return { faq: categoryToModel(faq), map };
}

// Convert candidate entries to model's input context
function candidatesToModel(candidates: CandidateFAQ[]): unknown {
    return candidates.map(({ id, question, semantic_abstract }) =>
        ({ id, question, semantic_abstract }));
}

// Update the FAQ structure (mutate in place) based on the model's response
function modelToFaq(_faq: StructuredFAQ, map: FaqIdMap, candidates: CandidateFAQ[], response: FaqStructureSchema): void {
    const idsToCandidates = (ids: string[] ): StructuredFAQCandidate[] => ids.map(id => {
        const candidate = candidates.find(c => c.id === id);
        if (!candidate) throw new Error(`Unknown candidate ID: ${id}`);
        const { issue_number, question, answer } = candidate;
        return { issue_number, id, question, answer };
    });

    // Check that every candidate identifier is referenced exactly once
    const idCount = new Map<string, number>(candidates.map(c => [c.id, 0]));
    for (const id of response.flatMap(r => r.candidate_ids)) {
        const count = idCount.get(id);
        if (count === undefined) throw new Error(`Unknown candidate ID: ${id}`);
        idCount.set(id, count + 1);
    }
    const multipleIdReferences = [...idCount.entries()].filter(([, count]) => count !== 1).map(([id]) => id);
    if (multipleIdReferences.length) {
        throw new Error(`Multiple candidate ID references: ${formatList(multipleIdReferences)}`);
    }

    // Add the candidates to the FAQ structure
    for (const { subcategory, candidate_ids } of response) {
        const subcategoryCandidates: StructuredFAQCandidate[] = idsToCandidates(candidate_ids);
        const description = `Adding ${plural(subcategoryCandidates.length, 'candidate entry')} to`;

        // Add the candidates to this category
        if ('leaf_id' in subcategory) {
            const { leaf_id } = subcategory;
            const mappedId = map.get(leaf_id);
            if (!mappedId?.leaf) throw new Error(`Not an FAQ leaf ID: ${leaf_id}`);
            const { parent, leaf } = mappedId;

            // Assign to existing partition
            leaf.candidates.push(...subcategoryCandidates);
            core.info(`${description} existing partition '${parent.heading}' > '${leaf.partition}'`);
        } else {
            const { parent_id, heading } = subcategory;
            const mappedId = map.get(parent_id);
            if (!mappedId || mappedId.leaf) throw new Error(`Not an FAQ parent ID: ${parent_id}`);
            const { parent } = mappedId;
            if (parent.partitions.length === 1 && !parent.subcategories.length) {
                // Promote existing partition to subcategory
                const heading = parent.partitions[0]?.partition ?? 'New subcategory';
                parent.subcategories.push({ heading, preamble: '', partitions: parent.partitions, subcategories: [] });
                parent.partitions = [];
                core.info(`Promoted existing partition to subcategory '${parent.heading}' > '${heading}'`);
            }
            if (parent.subcategories.length) {
                // Create a new subcategory and a partition within
                const partition: StructuredFAQPartition = { entries: [], candidates: subcategoryCandidates };
                parent.subcategories.push({ heading, preamble: '', partitions: [partition], subcategories: [] });
                core.info(`${description} to new subcategory '${parent.heading}' > '${heading}'`);
            } else {
                // Create a new partition within the existing subcategory
                parent.partitions.push({ partition: heading, entries: [], candidates: subcategoryCandidates });
                core.info(`${description} to new partition '${parent.heading}' > '${heading}'`);
            }
        }
    }
}