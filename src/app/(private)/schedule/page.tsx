import ScheduleForm from "@/components/forms/ScheduleForm/ScheduleForm";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();

  if (userId == null) return redirectToSignIn();

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: {
      availabilities: true,
    },
  });

  return <ScheduleForm schedule={schedule} />;
}
