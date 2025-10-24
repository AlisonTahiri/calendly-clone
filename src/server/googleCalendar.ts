import { clerkClient } from "@clerk/nextjs/server";
import { addMinutes, endOfDay, startOfDay } from "date-fns";
import { google } from "googleapis";
import "server-only";
export async function getCalendarEventTimes(
  clerkUserId: string,
  { start, end }: { start: Date; end: Date }
) {
  const oAuthClient = await getOauthClient(clerkUserId);

  const events = await google.calendar("v3").events.list({
    auth: oAuthClient,
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    eventTypes: ["default"],
    singleEvents: true,
    maxResults: 2500,
  });

  return (
    events.data.items
      ?.map((event) => {
        if (event.start?.date != null && event.end?.date != null) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.end.date),
          };
        }

        if (event.start?.dateTime != null && event.end?.dateTime != null) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          };
        }
      })
      .filter((date) => date != null) || []
  );
}

export async function createCalendarEvent({
  clerkUserId,
  durationInMinutes,
  guestEmail,
  guestName,
  guestNotes,
  startTime,
  eventName,
  timezone,
}: {
  clerkUserId: string;
  guestName: string;
  guestEmail: string;
  guestNotes?: string;
  startTime: Date;
  durationInMinutes: number;
  eventName: string;
  timezone: string;
}) {
  const oAuthClient = await getOauthClient(clerkUserId);
  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);

  if (calendarUser.primaryEmailAddress == null) {
    throw new Error("User has no primary email address");
  }
  const calendarEvent = await google.calendar("v3").events.insert({
    calendarId: "primary",
    auth: oAuthClient,
    sendUpdates: "all",
    requestBody: {
      attendees: [
        {
          email: guestEmail,
          displayName: guestName,
        },
        {
          email: calendarUser.primaryEmailAddress.emailAddress,
          displayName: calendarUser.fullName,
          responseStatus: "accepted",
        },
      ],
      description: guestNotes ? `Additional details: ${guestNotes}` : undefined,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        timeZone: timezone,
        dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
      },
      summary: `${guestName} + ${calendarUser.fullName}: ${eventName}`,
    },
  });

  return calendarEvent.data;
}
async function getOauthClient(clerkUserId: string) {
  const token = await (
    await clerkClient()
  ).users.getUserOauthAccessToken(clerkUserId, "google");

  if (token.data.length === 0 || token.data[0].token == null) {
    return;
  }

  const client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
  });

  client.setCredentials({
    access_token: token.data[0].token,
  });
  return client;
}
