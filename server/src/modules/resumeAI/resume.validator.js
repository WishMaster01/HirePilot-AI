import { z } from "zod";

export const resumeCreateSchema = z.object({ title: z.string().min(1), content: z.string().optional() });
export const resumeAnalysisSchema = z.object({ targetKeywords: z.string().optional(), jobDescription: z.string().optional() });
