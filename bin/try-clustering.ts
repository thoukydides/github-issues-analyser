// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import HDBSCAN, { cosine, VectorPoint } from 'clusternova';
import { CandidateFAQ, loadCandidates } from './lib/data/candidates.js';
import { plural } from './lib/utils.js';
import { CONFIG, ConfigRepository } from './config.js';

// Clusternova's HDBSCAN requires 'id' and 'vector' properties
type CandidateVectorPoint = CandidateFAQ & VectorPoint;

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    // Try to cluster each configured repository
    for (const repo of CONFIG) {
        await generateClusters(repo);
    }
}

// Generate clusters for a single repository
async function generateClusters(repo: ConfigRepository): Promise<void> {
    // Load all candidate entries
    const candidates = loadCandidates(repo);

    // Prepare the candidates entries for clustering
    const data: CandidateVectorPoint[] = candidates.map(candidate =>
        ({ ...candidate, vector: candidate.embeddings.clustering } satisfies CandidateVectorPoint));

    // Attempt to cluster the candidate entries
    const hdbscan = new HDBSCAN.default(data, 2, cosine);
    const { clusters, outliers } = hdbscan.run();

    // Log the results
    core.info(`${plural(clusters.length, 'cluster')} + ${plural(outliers.length, 'outlier')}`);
    core.summary.addRaw(`### [\`${repo.owner}/${repo.repo}\`] FAQ Clusters`, true);
    clusters.forEach((cluster, index) => { listCandidates(`Cluster #${index}`, cluster); });
    listCandidates('Outliers', outliers);
    await core.summary.write();
}

// List the members of a cluster in the job summary
function listCandidates(description: string, candidates: CandidateVectorPoint[]): void {
    core.summary.addRaw(`#### ${description}`, true);
    for (const c of candidates) core.summary.addRaw(`- [#${c.id}] ${c.question}`, true);
}