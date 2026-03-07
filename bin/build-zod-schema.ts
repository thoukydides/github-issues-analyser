// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import path from 'node:path';
import * as core from '@actions/core';
import { jsonSchemaToZod, JsonSchemaObject } from 'json-schema-to-zod';
import { readPrompt } from './lib/inference/google-ai-studio.js';

// Input and output directories
const PROMPTS_DIR = '.';
const OUTPUT_DIR = './bin/lib/prompts';

// Source file extensions
const PROMPT_EXT = '.prompt.yml';

// Process all prompt files
const dirEntries = fs.readdirSync(PROMPTS_DIR);
const promptFiles = dirEntries.filter(name => name.endsWith(PROMPT_EXT));
for (const promptFile of promptFiles) {
    const name = path.basename(promptFile, PROMPT_EXT);

    // Paths to input prompt and output TypeScript file
    const promptPath = path.format({ dir: PROMPTS_DIR, name: promptFile });
    const outputPath = path.format({ dir: OUTPUT_DIR, name, ext: '.ts' });

    // Generate a type name for the schema (converting kebab-case to PascalCase)
    const typeName = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    const schemaName = `${typeName}Schema`;

    // Log the operation
    core.info(`${schemaName}: ${promptPath} → ${outputPath}`);

    // Read the JSON schema from the prompt and convert it to a Zod schema
    const prompt = readPrompt(promptPath);
    const jsonSchema = JSON.parse(prompt.jsonSchema) as JsonSchemaObject;
    const zodSchema = jsonSchemaToZod(jsonSchema, { module: 'esm', name: schemaName, type: true });

    // Write the Zod schema to the output file
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(outputPath, zodSchema, { encoding: 'utf8' });
}