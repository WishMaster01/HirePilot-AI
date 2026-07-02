import { z } from "zod";

export const badgeSchema = z.object({ key: z.string().min(1), name: z.string().optional(), description: z.string().optional(), xp: z.number().optional() });
