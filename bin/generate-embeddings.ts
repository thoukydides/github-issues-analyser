// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { IssueFAQ, IssueFAQWithHash, loadIssues } from './lib/data/issues.js';
import { CandidateFAQ, saveCandidates } from './lib/data/candidates.js';
import { generateEmbeddings } from './lib/embeddings/cache.js';
import { plural } from './lib/utils.js';

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
    // Load all saved issues
    const issues = loadIssues();

    // Flatten the candidate FAQ entries
    const preCandidates: PreCandidateFAQ[] = issues.flatMap(({ owner, repo, issue_number, faq }) =>
        faq.map(candidate =>
            ({ owner, repo, issue_number, id: makeID(issue_number, candidate),
                content: makeContent(candidate), ...candidate } satisfies PreCandidateFAQ)));

    // Generate the embeddings
    const embeddings = await generateEmbeddings(preCandidates.map(({ content }) => content));
    const candidates = embeddings.map((embeddings, index) => ({ ...preCandidates[index], embeddings }));
    const missingEmbeddings = candidates.filter(c => !c.embeddings).length;
    if (missingEmbeddings) core.warning(`${plural(missingEmbeddings, 'embedding')} missing`);

    // Save the candidate FAQ entries
    saveCandidates(candidates);
}

// Create issue content used for embeddings
function makeContent(faq: IssueFAQ): string {
    const { question, answer, semantic_abstract } = faq;
    return semantic_abstract ?? `# ${question}\n\n${answer}`;
}

// Create an ID for tracking candidate issues
function makeID(issue_number: number, candidate: IssueFAQWithHash): string {
    return `issue-${issue_number}-${candidate.hash.substring(0, 4)}`;
}


// Convert an issue FAQ candidate into a pre-embeddings candidate


// 1. Attempt to assign new candidate issues to clusters as discussed:
//    - Select cluster(s) based on min distance to any member and to centroid, with limits based on existing cluster size
//    - If multiple clusters selected pick the one with the closest member
//      (should cope with a large "other" category overlapping everything else)
//    - Treat all unassigned candidates as a new cluster
// 2. Any clusters exceeding a maximum size (say 10 members) attempt to use HDBSCAN to partition them
//    (with multiple MPTS values tried, if necessary)
//    - Outliers are treated as their own cluster
//    - Apply recursively to any sub-clusters that are still too large
//    - If a cluster remains too large then partition arbitrarily (to ensure it doesn't overflow model input context)
//
// For the initial run there are no existing clusters, so only step 3 applies.
// Subsequent runs adding new Q&A mostly assign to existing clusters, but will split them when they grow too large.