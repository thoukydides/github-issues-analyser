// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import * as core from '@actions/core';
import { plural } from '../utils.js';
import { GeminiEmbeddings } from '../embeddings/google-ai-studio.js';
import { ConfigRepository } from '../../config.js';
import { getEmbeddingsCachePath } from './paths.js';

// Load the cache file
export function loadEmbeddingsCache(repo: ConfigRepository): Map<string, GeminiEmbeddings> {
    const cacheFile = getEmbeddingsCachePath(repo);
    try {
        const json = fs.readFileSync(cacheFile, { encoding: 'utf8' });
        const cache = JSON.parse(json) as [string, GeminiEmbeddings][];
        core.info(`Loaded ${plural(cache.length, 'cached embedding')}`);
        return new Map(cache);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.warning(`Error reading cache file '${cacheFile}': ${message}`);
        return new Map<string, GeminiEmbeddings>();
    }
}

// Save the cache file
export function saveEmbeddingsCache(repo: ConfigRepository, cache: Map<string, GeminiEmbeddings>): void {
    const cacheFile = getEmbeddingsCachePath(repo);
    const json = JSON.stringify([...cache]);
    fs.writeFileSync(cacheFile, json);
    core.info(`Saved ${plural(cache.size, 'cached embedding')}`);
}