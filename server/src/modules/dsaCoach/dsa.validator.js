import { z } from "zod";

export const dsaAssessmentSchema = z.object({ topic: z.string().min(1), answers: z.unknown().optional() });
