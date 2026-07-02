import { z } from "zod";

export const jobMatchSchema = z.object({ resumeText: z.string().optional(), targetRoles: z.array(z.string()).optional() });
