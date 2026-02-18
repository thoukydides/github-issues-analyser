import { z } from 'zod';

export const FAQDraftSchema = z.object({
  category: z.string().describe('Section heading for this collection of FAQ entries'),
  reasoning: z.string().describe('Brief and concise explanation of major changes made: entries merged, split, updated, or excluded, and why'),
  entries: z.array(z.object({
    question: z.string().describe('A concise, searchable question'),
    answer: z.string().describe('The FAQ entry body in GitHub-flavoured Markdown'),
    ids: z.array(z.string().describe("The 'id' field from an existing or candidate entry")).describe('IDs of all existing and candidate entries that this entry replaces or incorporates')
  }).describe('A single FAQ entry')).describe('List of FAQ entries in this category')
}).describe('Revised collection of FAQ entries for a category');

export type FAQDraft = z.infer<typeof FAQDraftSchema>;
