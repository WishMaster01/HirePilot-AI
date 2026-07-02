import { z } from "zod";

export const roadmapSchema = z.object({ role: z.string().min(1), timeline: z.string().optional() });
