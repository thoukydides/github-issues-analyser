// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { getIssue, getIssues, Issue } from './lib/github/get-issue.js';
import { CONFIG } from './config.js';
import { ISSUE_DATE_PREFERRED, IssueData, loadIssuesMap } from './lib/data/issues.js';
import { plural } from './lib/utils.js';

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
    const filter = (issues: Issue[], predicate: (issue: Issue, saved?: IssueData) => boolean): Issue[] =>
        issues.filter(i => predicate(i, savedIssues.get(i.owner)?.get(i.repo)?.get(i.number)));
    issues = filter(issues, (i, saved) => !saved                        // (unprocessed)
        || new Date(saved.updated_at) < new Date(i.updated_at)          // (issue updated)
        || new Date(saved.updated_at) < new Date(ISSUE_DATE_PREFERRED));// (prompt updated)
    core.info(`${plural(issues.length, 'issue')} require (re)analysis`);

    // Select preferred issues to process first
    const prefer = (description: string, predicate: (issue: Issue, saved?: IssueData) => boolean): void => {
        const filtered = filter(issues, predicate);
        if (filtered.length) {
            core.info(`Prefer ${description}: Selected ${filtered.length} of ${plural(issues.length, 'issue')}`);
            issues = filtered;
        }
    };
    prefer('never analysed',    (_, saved) => !saved);
    prefer('closed',            i => i.state === 'closed');

    // Select the least recently updated issue to process
    core.info(`Selected ${plural(issues.length, 'candidate issue')}`);
    issues.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    return issues[0];
}

// Prepare the state passed to the post-inference script
function makeState(issue: Issue): Omit<IssueData, 'faq'> {
    const { owner, repo, number } = issue;
    const updated_at = new Date().toISOString();
    return { owner, repo, issue_number: number, updated_at };
}