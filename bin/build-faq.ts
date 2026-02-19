// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { assertIsDefined, formatList, plural } from './lib/utils.js';
import { CONFIG, ConfigRepository } from './config.js';
import { saveMarkdownFAQ } from './lib/data/faq.js';
import { loadStructuredFAQ, saveStructuredFAQ, StructuredFAQ,
         StructuredFAQCategory, StructuredFAQPartition } from './lib/data/structure.js';
import { z } from 'zod';
import { geminiInference } from './lib/inference/google-ai-studio.js';

// Prompt file
const PROMPT_FILE = './faq-draft.prompt.yml';

// Model structured response (matches JSON schema in PROMPT_FILE)
const ResponseSchema = z.object({
    category:   z.string()          .describe('Section heading for this collection of FAQ entries'),
    entries:    z.array(
        z.object({
            question:   z.string()  .describe('A concise, searchable question'),
            answer:     z.string()  .describe('The FAQ entry body in GitHub-flavoured Markdown;'
                                        + ' represent paragraph breaks and list items using standard JSON newline escapes (`\n`);'
                                        + ' do not emit literal backslash characters before `n` unless they are intended to'
                                        + ' appear in the final Markdown'),
            ids:        z.array(
                z.string()          .describe("The 'id' field from an existing or candidate entry")
            )                       .describe('IDs of all existing and candidate entries that this entry replaces or incorporates')
        })                          .describe('A single FAQ entry')
    )                               .describe('List of FAQ entries in this category')
})                                  .describe('Revised collection of FAQ entries for a category');
type Response = z.infer<typeof ResponseSchema>;

// A single partition within a structured FAQ category
interface Partition {
    faq:        StructuredFAQ;
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
    let processed = false;
    for (const repo of CONFIG) {
        processed ||= await buildFAQ(repo);
    }
    if (!processed) core.notice('All FAQs up-to-date; nothing to do');
}

// Process a single partition for the specified repository
async function buildFAQ(repo: ConfigRepository): Promise<boolean> {
    // Load the current version of the structured FAQ
    const faq = loadStructuredFAQ(repo);
    if (!faq) {
        core.warning(`No structured FAQ for ${repo.owner}/${repo.repo}; skipping`);
        return false;
    }

    // Select a single partition with candidate entries requiring processing
    const selectedPartition = selectPartition(faq);
    if (!selectedPartition) return false;
    core.info(`Processing ${repo.owner}/${repo.repo} category "${selectedPartition.category.heading}"`
        + ` partition "${selectedPartition.partition.partition ?? 'unnamed'}"`);

    // Perform the AI inference
    const vars = partitionToModel(repo, selectedPartition);
    const response = await geminiInference(PROMPT_FILE, vars, ResponseSchema);
    modelToPartition(selectedPartition, response);

    // Save the updated FAQ
    saveStructuredFAQ(repo, faq);
    saveMarkdownFAQ(repo, faq);
    return true;
}

// Select a single FAQ partition to process
function selectPartition(faq: StructuredFAQ): Partition | undefined {
    const findUnprocessedPartition = (category: StructuredFAQCategory): Partition | undefined => {
        const partition = category.partitions.find(p => p.candidates.length);
        if (partition) return { faq, category, partition };
        for (const subcategory of category.subcategories) {
            const result = findUnprocessedPartition(subcategory);
            if (result) return result;
        }
    };
    return findUnprocessedPartition(faq);
}

// Convert FAQ partition to model's input context
function partitionToModel(repo: ConfigRepository, selected: Partition): Map<string, string> {
    const { category, partition } = selected;
    const contextExisting = {
        category:   partition.partition ?? category.heading,
        entries:    partition.entries.map(({ included_ids, ...entry }, index) => ({ ...entry, id: `faq-${index}` }))
    };
    const vars = new Map<string, string>([
        ['owner',       repo.owner],
        ['repository',  repo.repo],
        ['existing',    JSON.stringify(contextExisting)],
        ['candidates',  JSON.stringify(partition.candidates)]
    ]);
    return vars;
}

// Update FAQ partition from model's output
function modelToPartition(selected: Partition, response: Response): void {
    const { faq, category, partition } = selected;

    // Set the category or partition name
    if (category.partitions.length === 1 && !category.subcategories.length) {
        category.heading = response.category;
        partition.partition = undefined;
    } else partition.partition = response.category;

    // All identifiers referenced in the existing entries and candidates
    const allIds = new Set<string>([
        ...partition.entries.flatMap(e => e.included_ids),
        ...partition.candidates.map(c => c.id)
    ]);

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
    partition.candidates = [];

    // Add any post-update unreferenced IDs to the exclusion list
    const referencedIds = new Set<string>(partition.entries.flatMap(e => e.included_ids));
    const unreferencedIds = [...allIds].filter(id => !referencedIds.has(id));
    if (unreferencedIds.length) {
        faq.excluded_ids = [...new Set<string>([...faq.excluded_ids, ...unreferencedIds])];
        core.warning(`${plural(unreferencedIds.length, 'unreferenced identifier')}: ${formatList(unreferencedIds)}`);
    }
}
