import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { formatEventDescription } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>;
}) {
  const { clerkUserId } = await params;

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId: userIdCol, isActive }, { eq, and }) =>
      and(eq(userIdCol, clerkUserId), eq(isActive, true)),
    orderBy: ({ name }, { asc, sql }) => asc(sql`lower(${name})`),
  });

  if (events.length == 0) return notFound();

  const { fullName } = await (await clerkClient()).users.getUser(clerkUserId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-4xl md:text-5xl font-semibold mb-4 text-center capitalize">
        {fullName}
      </div>
      <div className="text-muted-foreground mb-4 text-center max-w-sm mx-auto">
        Welcome to my scheduling page. Please follow the instructions to add an
        event to my calendar.
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} {...event} clerkUserId={clerkUserId} />
        ))}
      </div>
    </div>
  );
}

type EventCardProps = {
  id: string;
  clerkUserId: string;
  name: string;
  description: string | null;
  durationInMinutes: number;
};

function EventCard({
  id,
  clerkUserId,
  name,
  description,
  durationInMinutes,
}: EventCardProps) {
  return (
    <Card className={"flex flex-col"}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description != null && <CardContent>{description}</CardContent>}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        <Button asChild>
          <Link href={`/book/${clerkUserId}/${id}`}>Select</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
