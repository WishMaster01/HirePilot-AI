import { z } from "zod";

export const notificationSchema = z.object({ title: z.string().min(1), message: z.string().min(1) });
