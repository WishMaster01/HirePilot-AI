import { z } from "zod";

export const placementSchema = z.object({ company: z.string().min(1), role: z.string().min(1), status: z.string().optional(), notes: z.string().optional() });
