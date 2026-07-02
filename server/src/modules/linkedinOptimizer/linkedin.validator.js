import { z } from "zod";

export const linkedInAnalysisSchema = z.object({ profileUrl: z.string().url().optional(), profileText: z.string().optional() });
