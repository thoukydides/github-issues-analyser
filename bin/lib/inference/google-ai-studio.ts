// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import * as core from '@actions/core';
import fs from 'node:fs';
import { ContentListUnion, ContentUnion, FinishReason, GenerateContentParameters, GoogleGenAI, ThinkingLevel } from '@google/genai';
import { load as yamlLoad } from 'js-yaml';
import z, { ZodType } from 'zod';
import { JSONSchema } from 'zod/v4/core';

// Default model
const DEFAULT_MODEL = 'gemini-3-flash-preview';

// Prompt file format
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const makeMessageSchema = <T extends string>(role: T) => z.strictObject({
    role:       z.literal(role),
    content:    z.string()
});
const SystemMessageSchema = makeMessageSchema('system');
const UserMessageSchema   = makeMessageSchema('user');
const PromptSchema = z.strictObject({
    model:          z.optional(z.string()),
    messages:       z.union([
        z.tuple([UserMessageSchema], UserMessageSchema),
        z.tuple([SystemMessageSchema, UserMessageSchema], UserMessageSchema)
    ]),
    responseFormat: z.literal('json_schema'),
    jsonSchema:     z.string()
});
export type Prompt = z.infer<typeof PromptSchema>;

// Perform inference using Google AI Studio
export async function geminiInference<T extends ZodType>(promptPath: string, vars: Map<string, string>, schema?: T): Promise<z.infer<T>> {
    // Create a client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    const ai = new GoogleGenAI({ apiKey });

    // Parse the prompt and prepare the input messages
    const prompt = readPrompt(promptPath);
    const { systemInstruction, contents } = prepareContext(prompt, vars);

    // Prepare the JSON schema (prefer Zod schema, with fallback to prompt)
    const responseJsonSchema = schema
        ? z.toJSONSchema(schema)
        : JSON.parse(prompt.jsonSchema) as JSONSchema.JSONSchema;
    schema ??= z.fromJSONSchema(responseJsonSchema) as T;

    // Prepare the inference request
    const params: GenerateContentParameters = {
        model:      prompt.model ?? DEFAULT_MODEL,
        config: {
            systemInstruction,
            thinkingConfig: {
                includeThoughts:    true,
                thinkingLevel:      ThinkingLevel.HIGH
            },
            responseMimeType:   'application/json',
            responseJsonSchema
        },
        contents
    };

    // Log the request
    core.startGroup('Chat completion request');
    core.info(JSON.stringify(params, null, 4));
    core.endGroup();

    // Perform the inference
    const response = await ai.models.generateContent(params);
    core.debug(`Raw response:\n${JSON.stringify(response, null, 4)}`);

    // Log the results
    if (response.usageMetadata) {
        const { totalTokenCount, promptTokenCount, thoughtsTokenCount,
            candidatesTokenCount, cachedContentTokenCount } = response.usageMetadata;
        core.info(`Tokens used: ${totalTokenCount}`
            + ` (prompt=${promptTokenCount} + thoughts=${thoughtsTokenCount} + candidates=${candidatesTokenCount},`
            + ` cached=${cachedContentTokenCount})`);
    }
    const candidate = response.candidates?.[0];
    if (candidate?.finishReason !== FinishReason.STOP) {
        throw new Error(`Abnormal AI inference finish reason: ${candidate?.finishReason}`);
    }
    for (const part of candidate.content?.parts ?? []) {
        if (part.text && part.thought) {
            core.startGroup('Chat completion thoughts');
            core.info(part.text);
            core.endGroup();
        }
    }

    // Attempt to parse the result as JSON
    if (!response.text) throw new Error('No text response from AI');
    core.startGroup('Chat completion response');
    core.info(response.text);
    core.endGroup();
    return schema.parse(parseJSONResponse(response.text));
}

// Read the prompt file
export function readPrompt(promptPath: string): Prompt {
    const yaml = fs.readFileSync(promptPath, 'utf8');
    const parsed = yamlLoad(yaml);
    return PromptSchema.parse(parsed);
}

// Prepare the system and user messages
function prepareContext(
    prompt: Prompt,
    vars:   Map<string, string>
): { systemInstruction: ContentUnion | undefined, contents: ContentListUnion } {
    // Substitute template variables
    const messages = prompt.messages.map(message =>
        ({ ...message, content: substituteVars(message.content, vars) }));

    // Gemini requires the system instruction to be separate from user messages
    let systemInstruction: ContentUnion | undefined;
    if (messages[0]?.role === 'system') systemInstruction = messages.shift()?.content;

    // Convert the user messages to the format expected by the API
    const contents: ContentListUnion = messages.length === 1
        ? messages[0]?.content ?? ''
        : messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    return { systemInstruction, contents };
}

// Substitute template variables in a message
function substituteVars(message: string, vars: Map<string, string>): string {
    return message.replace(/\{\{([\w.-]+)\}\}/g, (_, varName: string) => {
        const varValue = vars.get(varName);
        if (varValue === undefined) throw new Error(`Undefined template variable: ${varName}`);
        return varValue;
    });
}

// Parse a structured response, patching any known issues
function parseJSONResponse(response: string): unknown {
    // Parse as JSON, checking for correctly escaped newlines within strings
    const status = { anyNewline: false };
    const json: unknown = JSON.parse(response, (_, value): unknown => {
        if (typeof value === 'string' && value.includes('\n')) status.anyNewline = true;
        return value;
    });
    if (status.anyNewline) return json;

    // If none found, parse again replacing incorrectly double-escaped newlines
    return JSON.parse(response, (_, value: unknown) =>
        typeof value === 'string' ? value.replaceAll(/(?<!\\)\\n/g, '\n') : value);
}