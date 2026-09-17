import { google } from "googleapis";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getOAuthClient } from "../config/googleAuth.js";

function encodeMessage(to, subject, body) {
  const message = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const sendEmailTool = tool(
  async ({ to, subject, body }) => {
    const auth = getOAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    const raw = encodeMessage(to, subject, body);
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return `Email sent to ${to} with subject "${subject}". Message ID: ${res.data.id}`;
  },
  {
    name: "send_email",
    description:
      "Send an email via Gmail on the user's behalf. Use this only once you have a clear recipient, subject, and body. Always confirm the draft with the user before calling this if any detail was assumed.",
    schema: z.object({
      to: z.string().email().describe("Recipient email address"),
      subject: z.string().describe("Email subject line"),
      body: z.string().describe("Plain-text email body"),
    }),
  }
);

export const searchEmailTool = tool(
  async ({ query, maxResults }) => {
    const auth = getOAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    const list = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: maxResults ?? 5,
    });

    if (!list.data.messages || list.data.messages.length === 0) {
      return "No matching emails found.";
    }

    const summaries = await Promise.all(
      list.data.messages.map(async (m) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });
        const headers = msg.data.payload.headers;
        const get = (name) => headers.find((h) => h.name === name)?.value ?? "";
        return `- From: ${get("From")} | Subject: ${get("Subject")} | Date: ${get("Date")} | Snippet: ${msg.data.snippet}`;
      })
    );

    return summaries.join("\n");
  },
  {
    name: "search_email",
    description:
      "Search the user's Gmail inbox using Gmail search syntax (e.g. 'from:boss@company.com is:unread'). Returns subject, sender, date and a snippet for each match.",
    schema: z.object({
      query: z.string().describe("Gmail search query"),
      maxResults: z.number().optional().describe("Max results to return, default 5"),
    }),
  }
);
