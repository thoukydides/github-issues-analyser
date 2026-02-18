// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { assertIsDefined } from '../utils.js';
import { GeminiEmbeddings, geminiGenerateEmbeddings } from './google-ai-studio.js';
import { loadEmbeddingsCache, saveEmbeddingsCache } from '../data/embeddings-cache.js';
import { ConfigRepository } from '../../config.js';

// Calculate embeddings for a list of strings, using cached results if possible
// (may return partial results if an API request fails)
export async function generateEmbeddings(repo: ConfigRepository, contents: string[]): Promise<(GeminiEmbeddings | undefined)[]> {
    // Load the cached embeddings
    const cache = loadEmbeddingsCache(repo);

    // Identify the contents that are not already in the cache
    const newContents = contents.filter(c => !cache.has(c));

    // Generate new embeddings
    const newEmbeddings = await geminiGenerateEmbeddings(newContents);

    // Update and save the cached embeddings
    newEmbeddings.forEach((embedding, index) => {
        const content = newContents[index];
        assertIsDefined(content); // newEmbeddings.length <= newContents.length
        cache.set(content, embedding);
    });
    saveEmbeddingsCache(repo, cache);

    // Combine the cached and new embeddings
    return contents.map(c => cache.get(c) ?? newEmbeddings[newContents.indexOf(c)]);
}