// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import path from 'node:path';
import * as core from '@actions/core';
import { plural } from '../utils.js';
import { Embeddings } from '../embeddings/google-ai-studio.js';

// A candidate FAQ entry
export interface CandidateFAQ {
    owner:          string;
    repo:           string;
    issue_number:   number;
    id:             string;
    embeddings?:    Embeddings;
    question:       string;
    answer:         string;
}

// File containing candidate FAQ entries with their embeddings
const CANDIDATES_FILE = './data/embeddings/candidates.json';

// Load the candidate FAQ entries
export function loadCandidates(): CandidateFAQ[] {
    const json = fs.readFileSync(CANDIDATES_FILE, { encoding: 'utf8' });
    const candidates = JSON.parse(json) as CandidateFAQ[];
    core.info(`Loaded ${plural(candidates.length, 'candidate entry')}`);
    return candidates;
}

// Save the candidate FAQ entries
export function saveCandidates(candidates: CandidateFAQ[]): void {
    // Ensure that the directory exists
    const candidatesDir = path.dirname(CANDIDATES_FILE);
    fs.mkdirSync(candidatesDir, { recursive: true });

    // Save the file
    const json = JSON.stringify(candidates);
    fs.writeFileSync(CANDIDATES_FILE, json);
    core.info(`Saved ${plural(candidates.length, 'candidate entry')}`);
}