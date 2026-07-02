import { z } from "zod";

export const videoAnalysisSchema = z.object({ interviewId: z.string().min(1) });
