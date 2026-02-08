// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { GitHub } from '@actions/github/lib/utils';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import * as core from '@actions/core';
import { plural } from '../utils.js';

// GitHub REST API type
type RestIssue = RestEndpointMethodTypes['issues']['get']['response']['data'];

// An issue with owner and repo added
export interface Issue extends RestIssue {
    owner:  string;
    repo:   string;
}

// Retrieve a single issue
export async function getIssue(
    octokit:        InstanceType<typeof GitHub>,
    owner:          string,
    repo:           string,
    issue_number:   number
): Promise<Issue> {
    const issue = (await octokit.rest.issues.get({ owner, repo, issue_number })).data;
    core.info(`Retrieved issue #${issue_number}: ${issue.title}`);
    core.debug(`REST API Issue:\n${JSON.stringify(issue, null, 4)}`);
    return { owner, repo, ...issue };
}

// Retrieve all issues in a repository
export async function getIssues(
    octokit:    InstanceType<typeof GitHub>,
    owner:      string,
    repo:       string
): Promise<Issue[]> {
    const issuesAndPRs = await octokit.paginate(octokit.rest.issues.listForRepo, {
        owner, repo, state: 'all', sort: 'created', direction: 'asc'
    });
    const issues = issuesAndPRs.filter(i => !i.pull_request);
    core.info(`Retrieved ${plural(issues.length, 'issue')}`);
    core.debug(`REST API Issues:\n${JSON.stringify(issues, null, 4)}`);
    return issues.map(i => ({ owner, repo, ...i }));
}