// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { getIssue, getIssues, Issue } from './lib/github/get-issue.js';
import { CONFIG } from './config.js';
import { IssueData, loadIssuesMap } from './lib/data/issue.js';

try {
    await run();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
}

// Main entry point
async function run(): Promise<void> {
    const token         = process.env.GITHUB_TOKEN;
    const repository    = process.env.REPOSITORY;
    const issue_number  = Number(process.env.ISSUE_NUMBER);

    // Prepare an Octokit client
    if (!token) throw new Error('GITHUB_TOKEN environment variable not set');
    const octokit = getOctokit(token);

    // Select the issue to process
    const issue = repository && issue_number
        ? await selectSpecifiedIssue(octokit, repository, issue_number)
        : await selectNextIssue(octokit);
    if (!issue) {
        core.notice('No issue to process');
        return;
    }

    // Add to the workflow summary
    const issue_repository = `${issue.owner}/${issue.repo}`;
    await core.summary
        .addRaw(`### [\`${issue_repository}\`] ${issue.title} [#${issue.number}](${issue.html_url})`, true)
        .write();

    // Set outputs
    core.setOutput('repository',    issue_repository);
    core.setOutput('issue_number',  issue.number);
    core.setOutput('state',         makeState(issue));
}

// Select the specified issue (if it exists)
async function selectSpecifiedIssue(octokit: InstanceType<typeof GitHub>, repository: string, issue_number: number): Promise<Issue> {
    const [owner, repo] = repository.split('/', 2);
    return await getIssue(octokit, owner, repo, issue_number);
}

// Select the highest priority issue
async function selectNextIssue(octokit: InstanceType<typeof GitHub>): Promise<Issue | undefined> {
    // Read all processed issues
    const savedIssues = loadIssuesMap();

    // Retrieve all issues from all configured repos
    let issues: Issue[] = (await Promise.all(
        CONFIG.map(({ owner, repo }) => getIssues(octokit, owner, repo))
    )).flat();

    // Exclude issues that have already been processed since their last update
    issues = issues.filter(i => {
        const saved = savedIssues.get(i.owner)?.get(i.repo)?.get(i.number);
        return !saved || new Date(saved.updated_at) < new Date(i.updated_at);
    });

    // Select the least recently updated issue to process
    issues.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    return issues[0];
}

// Prepare the state passed to the post-inference script
function makeState(issue: Issue): Omit<IssueData, 'faq'> {
    const { owner, repo, id, updated_at } = issue;
    return { owner, repo, issue_number: id, updated_at };
}