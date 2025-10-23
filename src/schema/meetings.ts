import { startOfDay } from "date-fns";
import { z } from "zod";

const meetingSchemaBase = {
  startTime: z.date().min(new Date()),
  guestEmail: z.string().email().min(1, "Please enter a guest email."),
  guestName: z.string().min(1, "Please enter a guest name."),
  guestNotes: z.string().optional(),
  timezone: z.string().min(1, "Please enter a timezone."),
};

export const meetingFormSchema = z
  .object({
    date: z.date().min(startOfDay(new Date()), "Date must be in the future."),
  })
  .extend(meetingSchemaBase);

export const meetingActionSchema = z
  .object({
    eventId: z.string().min(1, "Required"),
    clerkUserId: z.string().min(1, "Required"),
  })
  .extend(meetingSchemaBase);
