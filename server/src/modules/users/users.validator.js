import { z } from "zod";

export const userProfileSchema = z.object({ name: z.string().min(1).optional(), imageUrl: z.string().url().optional() });
