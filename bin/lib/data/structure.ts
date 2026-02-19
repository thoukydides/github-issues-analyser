// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import * as core from '@actions/core';
import { plural } from '../utils.js';
import { ConfigRepository } from '../../config.js';
import { getStructuredFAQPath } from './paths.js';

// A structured FAQ
export interface StructuredFAQEntry {
    question:       string;
    answer:         string;
}
export interface StructuredFAQExisting extends StructuredFAQEntry {
    included_ids:   string[];
}
export interface StructuredFAQCandidate extends StructuredFAQEntry {
    issue_number:   number;
    id:             string;
}
export interface StructuredFAQPartition {
    partition?:     string;
    entries:        StructuredFAQExisting[];
    candidates:     StructuredFAQCandidate[];
}
export interface StructuredFAQCategory {
    heading:        string;
    preamble:       string;
    partitions:     StructuredFAQPartition[];
    subcategories:  StructuredFAQCategory[];
}
export interface StructuredFAQ extends StructuredFAQCategory {
    excluded_ids:   string[];
    source_hashes:  Record<string, string>;
}

// Load the structured FAQ
export function loadStructuredFAQ(repo: ConfigRepository): StructuredFAQ {
    const faqFile = getStructuredFAQPath(repo);
    const json = fs.readFileSync(faqFile, { encoding: 'utf8' });
    const faq = JSON.parse(json) as StructuredFAQ;
    core.info(`Loaded structured: ${describeStructuredFAQ(faq)}`);
    return faq;
}

// Save the structured FAQ
export function saveStructuredFAQ(repo: ConfigRepository, faq: StructuredFAQ): void {
    const faqFile = getStructuredFAQPath(repo);
    const json = JSON.stringify(faq, null, 4);
    fs.writeFileSync(faqFile, json);
    core.info(`Saved structured: ${describeStructuredFAQ(faq)}`);
}

// Generate a description of a structured FAQ
export function describeStructuredFAQ(faq: StructuredFAQ): string {
    const count = { categories: 0, partitions: 0, unprocessed: 0, entries: 0, candidates: 0 };
    const countEntries = (category: StructuredFAQCategory): void => {
        ++count.categories;
        count.partitions += category.partitions.length;
        for (const partition of category.partitions) {
            if (partition.candidates.length) ++count.unprocessed;
            count.entries += partition.entries.length;
            count.candidates += partition.candidates.length;
        }
        for (const subcategory of category.subcategories) countEntries(subcategory);
    };
    countEntries(faq);
    return `${plural(count.entries, 'entry')} in ${plural(count.categories, 'category')}`
        + ` (${plural(count.candidates, 'candidate')} in ${count.unprocessed}`
        + ` of ${plural(count.partitions, ['partition', 'partitions'])} require processing)`;
}