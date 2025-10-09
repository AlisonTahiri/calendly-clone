import { z } from "zod";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";

const timeSlotSchema = z.object({
  startTime: z
    .string()
    .regex(
      /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/,
      "Time must be in the format HH:MM (00-23 for hours, 00-59 for minutes)"
    ),
  endTime: z
    .string()
    .regex(
      /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/,
      "Time must be in the format HH:MM (00-23 for hours, 00-59 for minutes)"
    ),
});

const dayAvailabilitySchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
  timeSlots: z
    .array(timeSlotSchema)

    .superRefine((timeslots, ctx) => {
      timeslots.forEach((timeSlot, index) => {
        const overlaps = timeslots.some((t, i) => {
          return (
            i !== index &&
            timeToInt(t.startTime) < timeToInt(timeSlot.endTime) &&
            timeToInt(t.endTime) > timeToInt(timeSlot.startTime)
          );
        });

        if (overlaps) {
          ctx.addIssue({
            code: "custom",
            message: "Availability overlaps with another",
            path: [index, "endTime"],
          });
        }
        if (timeToInt(timeSlot.startTime) >= timeToInt(timeSlot.endTime)) {
          ctx.addIssue({
            code: "custom",
            message: "Start time must be before end time",
            path: [index, "startTime"],
          });
        }
      });
    }),
});

export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, "Timezone is required."),
  availabilities: z
    .array(dayAvailabilitySchema)
    .min(1, "At least one day must be configured."),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

// export const scheduleFormSchema = z.object({
//   timezone: z.string().min(1, "Required"),
//   availabilities: z
//     .array(
//       z.object({
//         dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
//         startTime: z
//           .string()
//           .regex(
//             /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/,
//             "Time must be in the format H:MM or HH:MM (00-23 for hours, 00-59 for minutes)"
//           ),

//         endTime: z
//           .string()
//           .regex(
//             /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/,
//             "Time must be in the format H:MM or HH:MM (00-23 for hours, 00-59 for minutes)"
//           ),
//       })
//     )
//     .superRefine((availabilities, ctx) => {
//       availabilities.forEach((availability, index) => {
//         const overlaps = availabilities.some((a, i) => {
//           return (
//             i !== index &&
//             a.dayOfWeek === availability.dayOfWeek &&
//             timeToInt(a.startTime) < timeToInt(availability.endTime) &&
//             timeToInt(a.endTime) > timeToInt(availability.startTime)
//           );
//         });

//         if (overlaps) {
//           ctx.addIssue({
//             code: "custom",
//             message: "Availability overlaps with another",
//             path: [index],
//           });
//         }
//         if (
//           timeToInt(availability.startTime) >= timeToInt(availability.endTime)
//         ) {
//           ctx.addIssue({
//             code: "custom",
//             message: "Start time must be before end time",
//             path: [index, "startTime"],
//           });
//         }
//       });
//     }),
// });
