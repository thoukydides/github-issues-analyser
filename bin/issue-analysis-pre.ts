// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { getIssue, getIssues, Issue } from './lib/github/get-issue.js';
import { CONFIG, ConfigRepository } from './config.js';
import { ISSUE_DATE_PREFERRED, IssueData, loadIssuesMap } from './lib/data/issues.js';
import { plural } from './lib/utils.js';
import { IssueAnalysisState } from './issue-analysis-post.js';

// A single issue in a specific repository
interface IssueRepo {
    repo:   ConfigRepository;
    issue:  Issue;
}

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
    const selected = repository && issue_number
        ? await selectSpecifiedIssue(octokit, repository, issue_number)
        : await selectNextIssue(octokit);
    if (!selected) {
        core.notice('No issue to process');
        return;
    }

    // Add to the workflow summary
    const { owner, repo } = selected.repo;
    const issue_repository = `${owner}/${repo}`;
    const { title, number, html_url } = selected.issue;
    await core.summary
        .addRaw(`### [\`${issue_repository}\`] ${title} [#${number}](${html_url})`, true)
        .write();

    // Set outputs
    core.setOutput('repository',    issue_repository);
    core.setOutput('issue_number',  selected.issue.number);
    core.setOutput('state',         makeState(selected));
}

// Select the specified issue (if it exists)
async function selectSpecifiedIssue(octokit: InstanceType<typeof GitHub>, repository: string, issue_number: number): Promise<IssueRepo> {
    const [owner, repoPart] = repository.split('/', 2);
    if (!owner || !repoPart) throw new Error(`Invalid repository: ${repository}`);
    const repo = { owner, repo: repoPart };
    const issue = await getIssue(octokit, repo, issue_number);
    return { repo, issue };
}

// Select the highest priority issue
async function selectNextIssue(octokit: InstanceType<typeof GitHub>): Promise<IssueRepo | undefined> {
    // Read all processed issues
    const savedIssues = loadIssuesMapForAllRepos();

    // Retrieve all issues from all configured repos
    let issues = await getIssuesForAllRepos(octokit);

    // Exclude issues that have already been processed since their last update
    const findSaved = ({ repo, issue }: IssueRepo): IssueData | undefined =>
        savedIssues.get(repo.owner)?.get(repo.repo)?.get(issue.number);
    const filter = (issues: IssueRepo[], predicate: (issue: IssueRepo, saved?: IssueData) => boolean): IssueRepo[] =>
        issues.filter(i => predicate(i, findSaved(i)));
    issues = filter(issues, (i, saved) => !saved                        // (unprocessed)
        || new Date(saved.updated_at) < new Date(i.issue.updated_at)    // (issue updated)
        || new Date(saved.updated_at) < new Date(ISSUE_DATE_PREFERRED));// (prompt updated)
    core.info(`${plural(issues.length, 'issue')} require (re)analysis`);

    // Select preferred issues to process first
    const prefer = (description: string, predicate: (issue: IssueRepo, saved?: IssueData) => boolean): void => {
        const filtered = filter(issues, predicate);
        if (filtered.length) {
            core.info(`Prefer ${description}: Selected ${filtered.length} of ${plural(issues.length, 'issue')}`);
            issues = filtered;
        }
    };
    prefer('never analysed',    (_, saved) => saved === undefined);
    prefer('closed',            i => i.issue.state === 'closed');

    // Select the least recently updated issue to process
    core.info(`Selected ${plural(issues.length, 'candidate issue')}`);
    issues.sort((a, b) => new Date(a.issue.updated_at).getTime() - new Date(b.issue.updated_at).getTime());
    return issues[0];
}

// Read all processed issues
function loadIssuesMapForAllRepos(): Map<string, Map<string, Map<number, IssueData>>> {
    const processed = new Map<string, Map<string, Map<number, IssueData>>>();
    for (const repo of CONFIG) {
        const ownerSet = processed.get(repo.owner) ?? new Map<string, Map<number, IssueData>>();
        processed.set(repo.owner, ownerSet);
        ownerSet.set(repo.repo, loadIssuesMap(repo));
    }
    return processed;
}

// Retrieve all issues from all configured repos
async function getIssuesForAllRepos(octokit: InstanceType<typeof GitHub>): Promise<IssueRepo[]> {
    return (await Promise.all(
        CONFIG.map(async repo => {
            const issues = await getIssues(octokit, repo);
            return issues.map(issue => ({ repo, issue }));
        })
    )).flat();
}

// Prepare the state passed to the post-inference script
function makeState(selected: IssueRepo): IssueAnalysisState {
    const { repo } = selected;
    const issue_number = selected.issue.number;
    const updated_at = new Date().toISOString();
    return { repo, issue: { issue_number, updated_at } };
}