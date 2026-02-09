// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { IssueFAQ, loadIssues } from './lib/data/issues.js';
import { CandidateFAQ, saveCandidates } from './lib/data/candidates.js';
import { generateEmbeddings } from './lib/embeddings/cache.js';
import { plural } from './lib/utils.js';

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    // Load all saved issues
    const issues = loadIssues();

    // Flatten the candidate FAQ entries
    const candidates: CandidateFAQ[] = issues.flatMap(({ owner, repo, issue_number, faq }) =>
        faq.map(candidate => ({ owner, repo, issue_number, ...candidate } satisfies CandidateFAQ)));

    // Generate the embeddings
    const contents = candidates.map(makeContent);
    const embeddings = await generateEmbeddings(contents);
    embeddings.forEach((embedding, index) => candidates[index].vector = embedding);
    const missingEmbeddings = candidates.filter(c => !c.vector).length;
    if (missingEmbeddings) core.warning(`${plural(missingEmbeddings, 'embedding')} missing`);

    // Save the candidate FAQ entries
    saveCandidates(candidates);
}

// Create issue content used for embeddings
function makeContent(faq: IssueFAQ): string {
    const { question, answer } = faq;
    return `# ${question}\n\n${answer}`;
}