// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { IssueData, saveIssue } from './lib/data/issues.js';
import { makeStableHash } from './lib/hash.js';
import { ConfigRepository } from './config.js';
import { IssueAnalysisSchema } from './lib/prompts/issue-analysis.js';

// State passed from the pre-inference script
export interface IssueAnalysisState {
    repo:   ConfigRepository;
    issue:  Omit<IssueData, 'faq'>;
}

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    const state    = JSON.parse(process.env.STATE    ?? '') as IssueAnalysisState;
    const analysis = IssueAnalysisSchema.parse(JSON.parse(process.env.ANALYSIS ?? ''));

    // Save the issue
    const faq = analysis.map(e => ({ ...e, hash: makeStableHash(e) }));
    const issue: IssueData = { ...state.issue, faq };
    saveIssue(state.repo, issue);

    // Add details of the analysis to the workflow summary
    for (const faq of analysis) {
        core.summary
            .addRaw(`### ${faq.question}`, true)
            .addRaw(`> ${faq.semantic_abstract}`, true)
            .addRaw('', true)
            .addRaw(faq.answer, true);
    }
    if (analysis.length) await core.summary.write();
    else core.notice('No FAQ entries extracted');
}