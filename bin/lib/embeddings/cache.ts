// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { assertIsDefined } from '../utils.js';
import { geminiGenerateEmbeddings } from './google-ai-studio.js';
import { loadEmbeddingsCache, saveEmbeddingsCache } from '../data/embeddings-cache.js';

// Calculate embeddings for a list of strings, using cached results if possible
// (may return partial results if an API request fails)
export async function generateEmbeddings(contents: string[]): Promise<(number[] | undefined)[]> {
    // Load the cached embeddings
    const cache = loadEmbeddingsCache();

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
    saveEmbeddingsCache(cache);

    // Combine the cached and new embeddings
    return contents.map(c => cache.get(c) ?? newEmbeddings[newContents.indexOf(c)]);
}