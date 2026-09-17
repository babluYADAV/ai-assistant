import { google } from "googleapis";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getOAuthClient } from "../config/googleAuth.js";

export const scheduleMeetingTool = tool(
  async ({ title, startTime, endTime, attendees, description, timeZone }) => {
    const auth = getOAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: title,
      description: description ?? "",
      start: { dateTime: startTime, timeZone: timeZone ?? "UTC" },
      end: { dateTime: endTime, timeZone: timeZone ?? "UTC" },
      attendees: (attendees ?? []).map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return `Meeting "${title}" scheduled for ${startTime} - ${endTime}. Link: ${res.data.htmlLink}`;
  },
  {
    name: "schedule_meeting",
    description:
      "Create a Google Calendar event with a Meet link and email invites to attendees. Only call this once date, time, duration and attendees are confirmed with the user.",
    schema: z.object({
      title: z.string().describe("Meeting title"),
      startTime: z.string().describe("ISO 8601 start datetime, e.g. 2026-09-20T14:00:00"),
      endTime: z.string().describe("ISO 8601 end datetime"),
      attendees: z.array(z.string().email()).optional().describe("Attendee email addresses"),
      description: z.string().optional().describe("Meeting agenda/description"),
      timeZone: z.string().optional().describe("IANA time zone, e.g. Asia/Kolkata"),
    }),
  }
);

export const checkAvailabilityTool = tool(
  async ({ startTime, endTime, timeZone }) => {
    const auth = getOAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        timeZone: timeZone ?? "UTC",
        items: [{ id: "primary" }],
      },
    });

    const busy = res.data.calendars.primary.busy;
    if (busy.length === 0) return "The user is free in that entire window.";

    const busySummary = busy
      .map((b) => `busy from ${b.start} to ${b.end}`)
      .join("; ");
    return `The user has conflicts: ${busySummary}`;
  },
  {
    name: "check_availability",
    description:
      "Check the user's primary Google Calendar for busy/free time within a window before proposing a meeting time.",
    schema: z.object({
      startTime: z.string().describe("ISO 8601 window start"),
      endTime: z.string().describe("ISO 8601 window end"),
      timeZone: z.string().optional().describe("IANA time zone"),
    }),
  }
);
