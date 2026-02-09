// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import HDBSCAN, { cosine, VectorPoint } from 'clusternova';
import { CandidateFAQ, loadCandidates } from './lib/data/candidates.js';
import { plural } from './lib/utils.js';

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
    // Load all candidate entries
    const candidates = loadCandidates();

    // HERE - Should do this separately per-repo

    // Prepare the candidates entries for clustering
    const filtered = candidates.filter(c => c.vector);
    if (filtered.length < candidates.length) core.warning('Ignoring candidate FAQ entries without embeddings');
    const data = filtered.map((v, i) => ({ ...v, id: i.toString() } as CandidateVectorPoint));

    // Attempt to cluster the candidate entries
    const hdbscan = new HDBSCAN.default(data, 2, cosine);
    const { clusters, outliers } = hdbscan.run();

    //core.info(JSON.stringify({ clusters, outliers }));
    core.info(`${plural(clusters.length, 'cluster')} + ${plural(outliers.length, 'outlier')}`);
    clusters.forEach((cluster, index) => { listCandidates(`Cluster #${index}`, cluster); });
    listCandidates('Outliers', outliers);
    await core.summary.write();
}

// List the members of a cluster in the job summary
function listCandidates(description: string, candidates: CandidateVectorPoint[]): void {
    core.summary.addRaw(`#### ${description}`, true);
    for (const c of candidates) core.summary.addRaw(`- [${c.repo}#${c.issue_number}] ${c.question}`, true);
}