// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import crypto from 'crypto';

// Generate a stable hash of a value
export function hash(value: unknown): string {
    // Convert the value to a stable serialisation
    const stable = stableStringify(value);

    // Generate a hash of the string
    return crypto.createHash('sha256').update(stable).digest('hex');
}

// Generate a stable serialisation of a value
function stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
        // Recursively serialise array elements in order
        return `[${value.map(stableStringify).join(',')}]`;
    } else if (typeof value === 'object' && value !== null) {
        // Sort keys and recursively serialise each
        const keys = Object.entries(value).sort((a, b) => a[0].localeCompare(b[0]));
        return `{${keys.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
    } else {
        // Primitive type (string, number, boolean, null)
        return JSON.stringify(value);
    }
}