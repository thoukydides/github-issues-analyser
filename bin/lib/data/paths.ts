// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import path from 'path';
import fs from 'node:fs';
import { ConfigRepository } from '../../config.js';

// Root path for all dynamic data
const ROOT_PATH = './data'; // + /<owner>/<repo>/

// Path to the issues directory for a repository or a specific issue file
export function getIssuesPath(repo: ConfigRepository, issue_number?: number): string {
    const issuesDir = path.join(ROOT_PATH, repo.owner, repo.repo, 'issues');
    fs.mkdirSync(issuesDir, { recursive: true });
    return issue_number ? path.join(issuesDir, `#${issue_number}.json`) : issuesDir;
}

// Path to the embeddings cache for a repository
export function getEmbeddingsCachePath(repo: ConfigRepository): string {
    return path.join(ROOT_PATH, repo.owner, repo.repo, 'embeddings-cache.json');
}

// Path to the candidate entries with embeddings for a repository
export function getCandidatesPath(repo: ConfigRepository): string {
    return path.join(ROOT_PATH, repo.owner, repo.repo, 'candidates.json');
}