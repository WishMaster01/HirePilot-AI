import { z } from "zod";

export const interviewSchema = z.object({ role: z.string().min(1), mode: z.string().min(1), experience: z.string().optional(), company: z.string().optional(), difficulty: z.string().optional() });
