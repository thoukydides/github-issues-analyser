// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import path from 'node:path';
import * as core from '@actions/core';
import { plural } from '../utils.js';

// Cache file
const CACHE_FILE = './data/embeddings/cache.json';

// Load the cache file
export function loadEmbeddingsCache(): Map<string, number[]> {
    try {
        const json = fs.readFileSync(CACHE_FILE, { encoding: 'utf8' });
        const cache = JSON.parse(json) as [string, number[]][];
        core.info(`Loaded ${plural(cache.length, 'cached embedding')}`);
        return new Map(cache);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.warning(`Error reading cache file '${CACHE_FILE}': ${message}`);
        return new Map<string, number[]>();
    }
}

// Save the cache file
export function saveEmbeddingsCache(cache: Map<string, number[]>): void {
    // Ensure that the directory exists
    const cacheDir = path.dirname(CACHE_FILE);
    fs.mkdirSync(cacheDir, { recursive: true });

    // Save the file
    const json = JSON.stringify([...cache]);
    fs.writeFileSync(CACHE_FILE, json);
    core.info(`Saved ${plural(cache.size, 'cached embedding')}`);
}