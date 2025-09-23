import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().min(1, "Please enter an event name."),
  description: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
  durationInMinutes: z.coerce
    .number<number>()
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0")
    .max(60 * 12, `Duration must be less than 12 hours (${60 * 12} minutes)`),
});
