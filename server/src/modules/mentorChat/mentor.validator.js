import { z } from "zod";

export const mentorChatSchema = z.object({ message: z.string().min(1), sessionId: z.string().optional() });
