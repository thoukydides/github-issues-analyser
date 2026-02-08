// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import path from 'node:path';
import * as core from '@actions/core';
import { plural } from '../utils.js';

// Date of compatible and preferred prompts
export const ISSUE_DATE_COMPATIBLE = '2026-02-08T00:00:00.000Z';

// Result of inference using issue-analysis.prompt.yaml
export type IssueConfidence = 'high' | 'medium' | 'low';
export interface IssueFAQ {
    question:                   string;
    answer:                     string;
    alternative_resolution?:    string;
    tags:                       string[];
    confidence:                 IssueConfidence;
}
export type IssueFAQs = IssueFAQ[];

// Per-issue stored data
export interface IssueData {
    owner:          string;
    repo:           string;
    issue_number:   number;
    updated_at:     string;
    faq:            IssueFAQs;
}

// Relative path to saved issues
const ISSUES_PATH = '.data/issues'; // + /<owner>/<repo>/#<issue>.json

// Load all saved issues
export function loadIssues(): IssueData[] {
    const issues: IssueData[] = [];
    let incompatible = 0;
    for (const issuePath of listFiles(ISSUES_PATH)) {
        if (!issuePath.endsWith('.json')) continue;

        // Read this issue's saved data
        const json = fs.readFileSync(issuePath, { encoding: 'utf8' });
        const issue = JSON.parse(json) as IssueData;

        // Ignore issues updated before the compatibility date
        if (new Date(issue.updated_at) < new Date(ISSUE_DATE_COMPATIBLE)) {
            ++incompatible;
            continue;
        }
        issues.push(issue);
    }
    core.info(`Loaded saved data for ${plural(issues.length, 'issue')}`
        + ` (${plural(incompatible, 'incompatible issue')} ignored)`);
    return issues;
}

// Load all saved issues, indexed by [owner][repo][issue_number]
export function loadIssuesMap(): Map<string, Map<string, Map<number, IssueData>>> {
    const issues = loadIssues();
    const map = new Map<string, Map<string, Map<number, IssueData>>>();
    for (const issue of issues) {
        const { owner, repo, issue_number } = issue;
        const repoMap = map.get(owner) ?? new Map<string, Map<number, IssueData>>();
        const issueNumberMap = repoMap.get(repo) ?? new Map<number, IssueData>();
        issueNumberMap.set(issue_number, issue);
        repoMap.set(repo, issueNumberMap);
        map.set(repo, repoMap);
    }
    return map;
}

// Save a single issue
export function saveIssue(issue: IssueData): void {
    const json = JSON.stringify(issue, null, 4);
    const { owner, repo, issue_number } = issue;

    // Ensure that the directory exists
    const issueDir = path.join(ISSUES_PATH, owner, repo);
    fs.mkdirSync(issueDir, { recursive: true });

    // Save the file
    const issuePath = path.join(issueDir, `#${issue_number}.json`);
    fs.writeFileSync(issuePath, json);
}

// Read directory contents (recursively)
function listFiles(dirPath: string, recursive = true): string[] {
    try {
        const entries = fs.readdirSync(dirPath, { encoding: 'utf8', withFileTypes: true, recursive });
        const files = entries.filter(e => e.isFile());
        return files.map(f => path.join(f.parentPath, f.name));
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.warning(`Error reading directory '${dirPath}': ${message}`);
        return [];
    }
}