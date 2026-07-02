import { z } from "zod";

export const careerProfileSchema = z.object({ education: z.string().optional(), techStack: z.array(z.string()).default([]), projects: z.array(z.string()).default([]), experience: z.string().optional(), interests: z.array(z.string()).default([]) });
