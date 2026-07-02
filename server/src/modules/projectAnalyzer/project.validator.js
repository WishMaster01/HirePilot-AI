import { z } from "zod";

export const projectAnalysisSchema = z.object({ githubUrl: z.string().url() });
