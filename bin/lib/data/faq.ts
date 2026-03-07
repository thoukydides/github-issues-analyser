// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

import fs from 'node:fs';
import * as core from '@actions/core';
import { ConfigRepository } from '../../config.js';
import { getInputFAQPath, getOutputFAQPath } from './paths.js';
import { describeStructuredFAQ, StructuredFAQ, StructuredFAQCategory, StructuredFAQPartition } from './structure.js';
import { assertIsDefined, plural } from '../utils.js';

// A Markdown section (not nested)
interface MarkdownSection {
    heading:    string;
    level?:     number; // (omitted for hidden category partitions)
    content:    string;
}

// Heading level for FAQ questions
const QUESTION_HEADING_LEVEL = 4;

// Load a Markdown format FAQ and parse into structured format
export function loadMarkdownFAQ(repo: ConfigRepository): StructuredFAQ {
    const faqFile = getInputFAQPath(repo);
    try {
        const markdown = fs.readFileSync(faqFile, 'utf8');
        return parseMarkdownFAQ(markdown);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.warning(`Error reading FAQ '${faqFile}': ${message}`);
        return {
            excluded_ids:   [],
            heading:        'Frequently Asked Questions (FAQ)',
            preamble:       '',
            partitions:     [],
            subcategories:  []
        } satisfies StructuredFAQ;
    }
}

// Save a Markdown format FAQ
export function saveMarkdownFAQ(repo: ConfigRepository, faq: StructuredFAQ): void {
    const faqFile = getOutputFAQPath(repo);
    const markdown = renderMarkdownFAQ(faq);
    fs.writeFileSync(faqFile, markdown);
    core.info(`Saved markdown: ${describeStructuredFAQ(faq)}`);
}

// Parse a Markdown format FAQ to a structured format
function parseMarkdownFAQ(markdown: string): StructuredFAQ {
    // Extract any excluded issues and split the FAQ into sections
    const { markdown: filteredMarkdown, ids: excluded_ids } = extractIds(markdown, 'EXCLUDED');
    const sections = splitSections(filteredMarkdown);

    // Stack of current categories and sub-categories
    const categories: StructuredFAQCategory[] = [];
    for (const section of sections) {
        switch (section.level) {
        case undefined: {
            // Hidden category partition
            const parentCategory = categories.at(-1);
            if (!parentCategory) throw new Error('No parent category for FAQ partition');
            if (section.content) core.warning('Discarding text after partition start');
            parentCategory.partitions.push({
                partition:  section.heading || undefined,
                entries:    [],
                candidates: []
            });
            break;
        }
        case QUESTION_HEADING_LEVEL: {
            // An FAQ entry in the current category and partition
            const parentCategory = categories.at(-1);
            if (!parentCategory) throw new Error('No parent category for FAQ entry');
            let partition = parentCategory.partitions.at(-1);
            if (!partition) {
                partition = { entries: [], candidates: [] };
                parentCategory.partitions.push(partition);
            }
            const { markdown: answer, ids: included_ids} = extractIds(section.content, 'INCLUDES');
            partition.entries.push({ question: section.heading, answer, included_ids });
            break;
        }
        default: {
            // A category heading
            if (section.level === 1 && categories.length) throw new Error('Multiple top-level headings');
            if (categories.length < section.level - 1) throw new Error('Missing intermediate heading levels');
            categories.length = section.level - 1;
            const category: StructuredFAQCategory = {
                heading:        section.heading,
                preamble:       section.content,
                partitions:     [],
                subcategories:  []
            };
            const parentCategory = categories.at(-1);
            categories.push(category);
            parentCategory?.subcategories.push(category);
        }
        }
    }

    // Return the top-level category as the structured FAQ
    const faqCategory = categories[0];
    if (!faqCategory) throw new Error('No FAQ loaded');
    const faq: StructuredFAQ = { ...faqCategory, excluded_ids };
    core.info(`Loaded FAQ: ${describeStructuredFAQ(faq)}`);
    return faq;
}

// Extract any matching candidate identifiers comments
function extractIds(markdown: string, prefix: string): { markdown: string, ids: string[] } {
    const regexp = new RegExp(`<!-- ${prefix}:(.*?)-->\n*`, 'gms');
    const ids = [...markdown.matchAll(regexp)].flatMap(match => (match[1] ?? '').split(/\s+/).filter(Boolean));
    markdown = markdown.replaceAll(regexp, '');
    return { markdown, ids };
}

// Generate an HTML comment listing candidate identifiers
function makeIdsComment(prefix: string, ids: string[]): string {
    if (!ids.length) return '';
    const uniqueIds = [...new Set(ids)].sort(compareIds).join(' ');
    return `<!-- ${prefix}: ${uniqueIds} -->\n`;
}

// Compare two candidate identifiers
export function compareIds(a: string, b: string): number {
    const aParts = a.split('-'), bParts = b.split('-');
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        const aPart = aParts[i], bPart = bParts[i];
        assertIsDefined(aPart); assertIsDefined(bPart);
        if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
            const aNum = Number(aPart), bNum = Number(bPart);
            if (aNum !== bNum) return aNum - bNum;
        } else {
            const cmp = aPart.localeCompare(bPart);
            if (cmp !== 0) return cmp;
        }
    }
    return aParts.length - bParts.length;
}

// Split a Markdown document into sections
function splitSections(markdown: string): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    for (const line of markdown.split('\n')) {
        const level = line.search(/[^#]/);
        const partitionMatch = /^<!-- PARTITION:?(.*?)-->\s*$/.exec(line);
        if (0 < level && level <= QUESTION_HEADING_LEVEL) {
            const heading = line.replace(/^#+/, '').trim();
            sections.push({ heading, level, content: '' });
        } else if (partitionMatch) {
            const heading = partitionMatch[1]?.trim() ?? '';
            sections.push({ heading, content: '' });
        } else {
            const section = sections.at(-1);
            if (section) section.content += line + '\n';
            else core.warning('Discarding text before first header');
        }
    }
    return sections.map(section => ({ ...section, content: section.content.trim() }));
}

// Convert a structured FAQ to Markdown
function renderMarkdownFAQ(faq: StructuredFAQ): string {
    let markdown = renderMarkdownFAQCategory(faq, 1);
    markdown += makeIdsComment('EXCLUDED', faq.excluded_ids);
    return markdown;
}

// Convert a structured FAQ category to Markdown
function renderMarkdownFAQCategory(category: StructuredFAQCategory, level: number): string {
    // Cannot nest categories beyond the heading level used for FAQ entries
    let { partitions, subcategories } = category;
    if (level === QUESTION_HEADING_LEVEL - 1 && subcategories.length) {
        // Convert any subcategories to partitions at the current level
        const subcategoryPartitions = flattenSubcategories(category);
        core.warning(`${plural(subcategoryPartitions.length, 'subcategory')} converted to partitions`,
                     { title: 'FAQ categories nested too deeply' });
        partitions = partitions.concat(subcategoryPartitions);
        subcategories = [];
    }

    // Category heading and preamble
    let markdown = `${'#'.repeat(level)} ${category.heading}\n\n`;
    if (category.preamble) {
        const preamble = category.preamble.replace(/^<!-- TOC-START -->(?:[\s\S]*<!-- TOC-END -->)?/gm, () =>
            '<!-- TOC-START -->\n'
            + renderMarkdownFAQContents(category, level)
            + '<!-- TOC-END -->'
        );
        markdown += `${preamble}\n\n`;
    }

    // FAQ entries directly under this category (all partitions)
    partitions.forEach((partition, index) =>{
        if (0 < index || partition.partition) {
            const heading = partition.partition;
            markdown += `<!-- PARTITION${heading ? `: ${heading}` : ''} -->\n\n`;
        }
        const questionHeading = '#'.repeat(QUESTION_HEADING_LEVEL);
        for (const entry of partition.entries) {
            markdown += `${questionHeading} ${entry.question}\n\n`;
            markdown += makeIdsComment('INCLUDES', entry.included_ids);
            markdown += `${entry.answer}\n\n`;
        }
        for (const candidate of partition.candidates) {
            markdown += `${questionHeading} 🚧 ${candidate.question} 🚧\n\n`;
            markdown += makeIdsComment('INCLUDES', [candidate.id]);
            markdown += `${candidate.answer}\n\n`;
        }
    });

    // Subcategories
    for (const subcategory of subcategories) {
        markdown += renderMarkdownFAQCategory(subcategory, level + 1);
    }
    return markdown;
}

// Construct a table of contents for a FAQ category and its subcategories
function renderMarkdownFAQContents(category: StructuredFAQCategory, level: number, prefix = ''): string {
    const makeAnchor = (heading: string): string =>
        heading.toLowerCase().replace(/\s+/g, '-').replace(/[^-\w]/g, '').trim();

    // Add any FAQ entries directly under this category
    let markdown = '';
    for (const partition of category.partitions) {
        for (const entry of partition.entries) {
            const { question } = entry;
            markdown += `${prefix}- [${question}](#${makeAnchor(question)})\n`;
        }
    }

    // Add any subcategories at the current level
    for (const subcategory of category.subcategories) {
        if (level < QUESTION_HEADING_LEVEL - 1) {
            // Nested subcategory with its own heading
            const { heading } = subcategory;
            markdown += `${prefix}- **[${heading}](#${makeAnchor(heading)})**\n`;
            markdown += renderMarkdownFAQContents(subcategory, level + 1, `${prefix}  `);
        } else {
            // Treat subcategories as partitions at the current level
            markdown += renderMarkdownFAQContents(subcategory, level, prefix);
        }
    }
    return markdown;
}

// Flatten subcategories to partitions (used for deeply nested FAQs)
function flattenSubcategories(category: StructuredFAQCategory, headings: string[] = []): StructuredFAQPartition[] {
    return category.subcategories.flatMap<StructuredFAQPartition>(subcategory => {
        const categoryHeadings = [...headings, subcategory.heading];
        const partitions = [...subcategory.partitions];
        if (partitions[0] && !partitions[0].partition) {
            // Use the (nested) category name for the first partition
            const partition = categoryHeadings.join(' / ');
            partitions[0] = { partition, ...partitions[0] };
        }
        const subcategoryPartitions = flattenSubcategories(subcategory, categoryHeadings);
        return [...partitions, ...subcategoryPartitions];
    });
}