import { z } from "zod";

export const checkoutSchema = z.object({ plan: z.string().min(1).optional() });
