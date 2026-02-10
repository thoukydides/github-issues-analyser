// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import { IssueData, IssueFAQs, saveIssue } from './lib/data/issues.js';
import { hash } from './lib/hash.js';

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    const state    = JSON.parse(process.env.STATE    ?? '') as Omit<IssueData, 'faq'>;
    const analysis = JSON.parse(process.env.ANALYSIS ?? '') as IssueFAQs;

    // Save the issue
    const faq = analysis.map(e => ({ ...e, hash: hash(e) }));
    const issue: IssueData = { ...state, faq };
    saveIssue(issue);

    // Add details of the analysis to the workflow summary
    for (const faq of analysis) {
        const emoji = { low: '🔴', medium: '🟡', high: '🟢' }[faq.confidence];
        core.summary
            .addRaw(`### ${emoji} ${faq.question}`, true)
            .addRaw(` ${faq.semantic_abstract ?? '(No abstract)'}`, true)
            .addRaw(faq.answer, true);
        if (faq.alternative_resolution) core.summary.addRaw(`*[${faq.alternative_resolution}]*`, true);
    }
    if (analysis.length) await core.summary.write();
    else core.notice('No FAQ entries extracted');
}