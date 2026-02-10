// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import { GoogleGenAI } from '@google/genai';
import { LocalTokenizer } from '@google/genai/tokenizer/node';
import * as core from '@actions/core';
import { formatList, plural } from '../utils.js';
import { setTimeout } from 'node:timers/promises';

// Embedding configuration
const MODEL                 = 'gemini-embedding-001';
const TASK_TYPES            = ['SEMANTIC_SIMILARITY', 'CLUSTERING'] as const;
type TaskType = typeof TASK_TYPES[number];
const OUTPUT_DIMENSIONALITY = 768; // 128 - 3072 (recommended 768, 1536, 3072)
const DECIMAL_PLACES        = 5;

// Model's input context length and rate limits
const MAX_INPUT_TOKENS      = 2048;     // (2048 input tokens/content)
const MAX_REQUEST_TOKENS    = 30_000;   // (30K tokens/minute)
const SLEEP_MS              = 1_000;    // (1 second)

// Use local tokenisation as fallback
const LOCAL_TOKENS_MODEL    = 'gemini-2.5-flash';   // (uses 'gemma3')
const LOCAL_TOKENS_SCALE    = 1.1;                  // (extra 10% margin)

// Multiple embeddings
export type EmbeddingType   = Lowercase<TaskType>;
export type Embedding       = number[];
export type Embeddings      = Record<EmbeddingType, Embedding>;

// Calculate embeddings for a list of strings
// (may return partial results if an API request fails)
export async function geminiGenerateEmbeddings(contents: string[]): Promise<Embeddings[]> {
    // Create a client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    const ai = new GoogleGenAI({ apiKey });

    // Count the tokens in the content
    const tokenCounts = await Promise.all(contents.map(c => getTokenCount(ai, c)));

    // HERE - Implement content truncation if this error ever gets thrown...
    const maxTokenCount = Math.max(...tokenCounts);
    if (MAX_INPUT_TOKENS < maxTokenCount) {
        throw new Error(`Maximum input tokens exceeded: ${maxTokenCount} > ${MAX_INPUT_TOKENS}`);
    }
    const truncated = contents;

    // Generate the embeddings in batches
    let requests = 0;
    const embeddings: Embeddings[] = [];
    try {
        while (embeddings.length < truncated.length) {
            // Batch as much content as possible into each request
            let availableTokens = MAX_REQUEST_TOKENS;
            const startIndex = embeddings.length;
            let endIndex = startIndex;
            while (endIndex < truncated.length && (tokenCounts[endIndex] ?? 0) <= availableTokens) {
                availableTokens -= tokenCounts[endIndex++] ?? 0;
            }
            const batch = truncated.slice(startIndex, endIndex);

            // Generate the embeddings for each required task type
            const results = await Promise.all(TASK_TYPES.map<Promise<[EmbeddingType, Embedding[]]>>(async taskType =>
                [taskType.toLowerCase() as EmbeddingType, await embeddingsRequest(ai, taskType, batch)]));
            const collated = batch.map((_, i) => Object.fromEntries(results.map(([k, v]) => [k, v[i]])) as Embeddings);
            embeddings.push(...collated);
            ++requests;

            // Sleep between requests due to tokens/minute rate limit
            if (embeddings.length < truncated.length) await setTimeout(SLEEP_MS);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.error(`Error generating embeddings: ${message}`);
    }

    // Return the embeddings
    core.info(`Generated ${embeddings.length} of ${plural(contents.length, 'embedding')}`
        + ` using ${plural(requests, 'API request')}`);
    return embeddings;
}

// Count the number of tokens in a string
async function getTokenCount(ai: GoogleGenAI, contents: string): Promise<number> {
    try {
        // Try the online tokeniser for accuracy
        const tokens = (await ai.models.countTokens({ model: MODEL, contents })).totalTokens;
        if (tokens !== undefined) return tokens;
        core.error('No token count returned');
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.error(`Error counting tokens: ${message}`);
    }

    // Use the local tokeniser for gemma3 as an approximation
    const tokeniser = new LocalTokenizer(LOCAL_TOKENS_MODEL);
    const tokens = (await tokeniser.countTokens(contents)).totalTokens;
    if (tokens !== undefined) return Math.ceil(tokens * LOCAL_TOKENS_SCALE);
    throw new Error('Failed to estimate token count');
}

// A single embeddings request for multiple strings
async function embeddingsRequest(ai: GoogleGenAI, taskType: TaskType, contents: string[]): Promise<Embedding[]> {
    // Generate the embeddings
    const response = await ai.models.embedContent({
        model:      MODEL,
        contents,
        config: {
            outputDimensionality:   OUTPUT_DIMENSIONALITY,
            taskType
        }
    });
    let usage = '';
    if (response.metadata?.billableCharacterCount !== undefined) {
        usage = ` (${plural(response.metadata.billableCharacterCount, 'billable character')})`;
    }

    // Check that the embedding vectors are as expected
    const embeddings = response.embeddings?.map(e => e.values ?? []);
    if (embeddings?.length !== contents.length) {
        throw new Error(`Mismatched number of embeddings (expected ${contents.length}, received ${embeddings?.length})`);
    }
    if (!embeddings.every(e => e.length === OUTPUT_DIMENSIONALITY)) {
        const dimensions = [...new Set(embeddings.map(e => String(e.length)))];
        throw new Error(`Mismatched embeddings dimensionality (expected ${OUTPUT_DIMENSIONALITY}, got ${formatList(dimensions)})`);
    }
    core.info(`Generated ${plural(contents.length, 'embedding')}${usage}`);

    // Normalise the embeddings (only 3072 dimension is returned normalised)
    return embeddings.map(normaliseEmbedding);
}

// Normalise an embedding and apply rounding
function normaliseEmbedding(values: Embedding): Embedding {
    const magnitude = Math.sqrt(values.reduce((acc, v) => acc + v * v, 0));
    if (magnitude === 0) return values;
    const normalised = values.map(v => v / magnitude);
    const rounded = normalised.map(v => Number(v.toFixed(DECIMAL_PLACES)));
    return rounded;
}