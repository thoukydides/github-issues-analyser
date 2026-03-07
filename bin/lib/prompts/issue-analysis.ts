import { z } from "zod"

export const IssueAnalysisSchema = z.array(z.object({ "question": z.string().describe("A concise, searchable question"), "answer": z.string().describe("Complete answer with all relevant details from the issue in GitHub-flavoured Markdown"), "semantic_abstract": z.string().describe("2-3 sentence abstract capturing core technical concepts for clustering, avoiding generic troubleshooting terminology") }).strict().describe("A potential FAQ entry extracted from the issue's comments")).describe("List of potential FAQ entries extracted from this issue")
export type IssueAnalysisSchema = z.infer<typeof IssueAnalysisSchema>
