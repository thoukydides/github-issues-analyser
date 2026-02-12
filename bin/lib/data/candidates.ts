// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import * as core from '@actions/core';
import { plural } from '../utils.js';
import { Embeddings } from '../embeddings/google-ai-studio.js';
import { ConfigRepository } from '../../config.js';
import { getCandidatesPath } from './paths.js';

// A candidate FAQ entry
export interface CandidateFAQ {
    issue_number:   number;
    id:             string;
    embeddings:     Embeddings;
    question:       string;
    answer:         string;
}

// Load the candidate FAQ entries
export function loadCandidates(repo: ConfigRepository): CandidateFAQ[] {
    const candidatesFile = getCandidatesPath(repo);
    const json = fs.readFileSync(candidatesFile, { encoding: 'utf8' });
    const candidates = JSON.parse(json) as CandidateFAQ[];
    core.info(`Loaded ${plural(candidates.length, 'candidate entry')}`);
    return candidates;
}

// Save the candidate FAQ entries
export function saveCandidates(repo: ConfigRepository, candidates: CandidateFAQ[]): void {
    const candidatesFile = getCandidatesPath(repo);
    const json = JSON.stringify(candidates);
    fs.writeFileSync(candidatesFile, json);
    core.info(`Saved ${plural(candidates.length, 'candidate entry')}`);
}