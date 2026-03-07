// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { assertIsDefined, plural } from './lib/utils.js';
import { CONFIG, ConfigRepository } from './config.js';
import { saveMarkdownFAQ } from './lib/data/faq.js';
import { loadStructuredFAQ, saveStructuredFAQ, StructuredFAQ,
         StructuredFAQCategory, StructuredFAQPartition } from './lib/data/structure.js';
import { geminiInference } from './lib/inference/google-ai-studio.js';
import { FaqDraftSchema } from './lib/prompts/faq-draft.js';
import { selectRelatedCandidates } from './lib/embeddings/partition.js';
import { loadCandidatesMap } from './lib/data/candidates.js';

// Prompt file
const PROMPT_FILE = './faq-draft.prompt.yml';

// Maximum number of candidates to process in a single inference request
const MAX_CANDIDATES = 20;

// A single partition within a structured FAQ category
interface Partition {
    category:   StructuredFAQCategory;
    partition:  StructuredFAQPartition;
}

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    let performedInference = false;
    for (const repo of CONFIG) {
        core.info(`\n${repo.owner}/${repo.repo}:`);
        performedInference = await buildFAQ(repo, performedInference);
    }
    if (!performedInference) core.notice('All FAQs up-to-date; nothing to do');
}

// Process a single partition for the specified repository
async function buildFAQ(repo: ConfigRepository, performedInference: boolean): Promise<boolean> {
    // Load the current version of the structured FAQ and all candidate entries
    const faq = loadStructuredFAQ(repo);
    if (!faq) {
        core.warning('No structured FAQ; skipping');
        return performedInference;
    }
    const allCandidates = loadCandidatesMap(repo);

    // Select a single partition with candidate entries requiring processing
    const selectedPartition = selectPartition(faq);
    if (!selectedPartition) {
        core.info('No unprocessed FAQ entries; nothing to do');
    } else if (performedInference) {
        core.warning(`Unprocessed FAQ entries in category "${selectedPartition.category.heading}"`);
    } else {
        core.info(`Processing category "${selectedPartition.category.heading}"`
        + ` partition "${selectedPartition.partition.partition ?? 'unnamed'}"`);

        // Limit the maximum number of candidates processed per inference
        const candidates = selectRelatedCandidates(
            allCandidates, selectedPartition.partition.candidates, MAX_CANDIDATES);

        // Perform the AI inference
        const existing = partitionToModel(selectedPartition);
        const vars = new Map<string, string>([
            ['owner',       repo.owner],
            ['repository',  repo.repo],
            ['existing',    JSON.stringify(existing)],
            ['candidates',  JSON.stringify(candidates)]
        ]);
        const response = await geminiInference(PROMPT_FILE, vars, FaqDraftSchema);
        performedInference = true;
        modelToPartition(selectedPartition, response);
    }

    // Save the updated FAQ
    saveStructuredFAQ(repo, faq);
    saveMarkdownFAQ(repo, faq);
    return performedInference;
}

// Select a single FAQ partition to process
function selectPartition(faq: StructuredFAQ): Partition | undefined {
    const findUnprocessedPartition = (category: StructuredFAQCategory): Partition | undefined => {
        const partition = category.partitions.find(p => p.candidates.length);
        if (partition) return { category, partition };
        for (const subcategory of category.subcategories) {
            const result = findUnprocessedPartition(subcategory);
            if (result) return result;
        }
    };
    return findUnprocessedPartition(faq);
}

// Convert FAQ partition to model's input context
function partitionToModel(selected: Partition): unknown {
    const identifiersToIssueNumbers = (ids: string[]): number[] => {
        const issueNumbers = new Set<number>();
        for (const id of ids) {
            const match = /^issue-(\d+)-/.exec(id);
            if (match) issueNumbers.add(Number(match[1]));
        }
        return [...issueNumbers];
    };

    // Prepare the existing FAQ entries for the model context
    const { category, partition } = selected;
    return {
        category:   partition.partition ?? category.heading,
        entries:    partition.entries.map(({ included_ids, ...entry }, index) =>
            ({ ...entry, id: `faq-${index}`, issue_numbers: identifiersToIssueNumbers(included_ids) }))
    };
}

// Update FAQ partition from model's output
function modelToPartition(selected: Partition, response: FaqDraftSchema): void {
    const { category, partition } = selected;

    // Set the category or partition name
    if (category.partitions.length === 1 && !category.subcategories.length) {
        category.heading = response.category;
        partition.partition = undefined;
    } else partition.partition = response.category;

    // Replace the FAQ entries with the model's output
    const mapId = (id: string): string[] => {
        if (id.startsWith('faq-')) {
            // Identifier references an existing entry, so expand to its list
            const index = Number(id.substring(4));
            const entry = partition.entries[index];
            assertIsDefined(entry);
            return entry.included_ids;
        } else return [id];
    };
    partition.entries = response.entries.map(({ ids, ...entry }) =>
        ({ ...entry, included_ids: ids.flatMap(mapId) }));

    // Removed referenced candidates
    const referencedIds = new Set<string>(partition.entries.flatMap(e => e.included_ids));
    partition.candidates = partition.candidates.filter(c => !referencedIds.has(c.id));
    if (partition.candidates.length) {
        core.info(`${plural(partition.candidates.length, 'candidate entry')} unprocessed`);
    }
}