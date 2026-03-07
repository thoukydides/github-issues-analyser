// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { IssueFAQWithHash, loadIssues } from './lib/data/issues.js';
import { CandidateFAQ, saveCandidates } from './lib/data/candidates.js';
import { generateEmbeddings } from './lib/embeddings/cache.js';
import { plural } from './lib/utils.js';
import { CONFIG, ConfigRepository } from './config.js';

// A pre-candidate FAQ entry (with content instead of embeddings)
interface PreCandidateFAQ extends Omit<CandidateFAQ, 'embeddings'> {
    content:    string;
}

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    // Generate embeddings for each configured repository
    for (const repo of CONFIG) {
        core.info(`\n${repo.owner}/${repo.repo}:`);
        await generateRepoEmbeddings(repo);
    }
}

// Generate embeddings for a single repository
async function generateRepoEmbeddings(repo: ConfigRepository): Promise<void> {
    // Load all saved issues
    const issues = loadIssues(repo);

    // Flatten the candidate FAQ entries
    const preCandidates: PreCandidateFAQ[] = issues.flatMap(({ issue_number, faq }) =>
        faq.map(candidate =>
            ({ issue_number, id: makeID(issue_number, candidate),
                content: makeContent(candidate), ...candidate } satisfies PreCandidateFAQ)));

    // Generate the embeddings
    const generatedEmbeddings = await generateEmbeddings(repo, preCandidates.map(({ content }) => content));

    // Convert back to candidate FAQ entries (only keeping those with embeddings)
    const candidates: CandidateFAQ[] = [];
    preCandidates.forEach(({ content, ...preCandidate }, index) => {
        const embeddings = generatedEmbeddings[index];
        if (embeddings) candidates.push({ ...preCandidate, embeddings });
    });
    const missingEmbeddings = preCandidates.length - candidates.length;
    if (missingEmbeddings) core.warning(`${plural(missingEmbeddings, 'embedding')} missing`);

    // Save the candidate FAQ entries
    saveCandidates(repo, candidates);
}

// Create issue content used for embeddings
function makeContent(faq: IssueFAQWithHash): string {
    const { question, answer, semantic_abstract } = faq;
    return semantic_abstract ?? `# ${question}\n\n${answer}`;
}

// Create an ID for tracking candidate issues
function makeID(issue_number: number, candidate: IssueFAQWithHash): string {
    return `issue-${issue_number}-${candidate.hash.substring(0, 4)}`;
}