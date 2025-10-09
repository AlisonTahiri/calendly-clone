"use server";
import "use-server";
import { z } from "zod";

import { scheduleFormSchema, ScheduleFormValues } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema";
import { BatchItem } from "drizzle-orm/batch";
import { eq } from "drizzle-orm";
import { Availability } from "@/components/forms/ScheduleForm/Main";

export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>
): Promise<{ error?: boolean } | undefined> {
  const { success, data } = scheduleFormSchema.safeParse(unsafeData);

  const { userId } = await auth();

  if (!success || !userId) {
    return {
      error: true,
    };
  }
  const dbTypeData = convertScheduleFormDataToDBData(data);

  const { availabilities, ...scheduleData } = dbTypeData;

  const [{ id: scheduleId }] = await db
    .insert(ScheduleTable)
    .values({ ...scheduleData, clerkUserId: userId })
    .onConflictDoUpdate({
      target: ScheduleTable.clerkUserId,
      set: scheduleData,
    })
    .returning({
      id: ScheduleTable.id,
    });

  const statements: [BatchItem<"pg">] = [
    db
      .delete(ScheduleAvailabilityTable)
      .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId)),
  ];

  if (availabilities.length > 0) {
    statements.push(
      db.insert(ScheduleAvailabilityTable).values(
        availabilities.map((availability) => ({
          ...availability,
          scheduleId,
        }))
      )
    );
  }

  await db.batch(statements);
}

type DBScheduleFormSchema = {
  timezone: string;
  availabilities: Availability[];
};

function convertScheduleFormDataToDBData(
  values: ScheduleFormValues
): DBScheduleFormSchema {
  const newAvailabilities: DBScheduleFormSchema["availabilities"] = [];

  values.availabilities.forEach((availability) => {
    availability.timeSlots.forEach((timeSlot) => {
      newAvailabilities.push({
        dayOfWeek: availability.dayOfWeek,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      });
    });
  });

  return {
    timezone: values.timezone,
    availabilities: newAvailabilities,
  };
}
