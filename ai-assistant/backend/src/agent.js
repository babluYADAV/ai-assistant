import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import "dotenv/config";

import { sendEmailTool, searchEmailTool } from "./tools/emailTools.js";
import {
  scheduleMeetingTool,
  checkAvailabilityTool,
} from "./tools/calendarTools.js";

const tools = [
  sendEmailTool,
  searchEmailTool,
  scheduleMeetingTool,
  checkAvailabilityTool,
];

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.3,
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an executive assistant AI. You help the user manage their inbox and their calendar.

Rules you must follow:
- Before sending any email or creating any meeting, restate the key details (recipient, subject/title, time) in plain language and make sure they match what the user asked for.
- If the user's request is ambiguous (no clear time, no clear recipient, no clear subject), ask a clarifying question instead of guessing.
- When scheduling a meeting, check availability first if the user hasn't given you an explicit confirmed time.
- Always use ISO 8601 datetimes with the user's stated time zone when calling tools; assume the user's local time zone if they don't give one, and say which one you assumed.
- Be concise. Report back what you did in one or two sentences once a tool call succeeds.
- Never fabricate email addresses; ask the user for one if it's missing.`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

let executorPromise = null;

async function getExecutor() {
  if (!executorPromise) {
    executorPromise = createOpenAIToolsAgent({ llm, tools, prompt }).then(
      (agent) =>
        new AgentExecutor({
          agent,
          tools,
          verbose: false,
        })
    );
  }
  return executorPromise;
}

// naive in-memory per-session history (swap for Redis/DB for real multi-user use)
const sessions = new Map();

export async function runAgent(sessionId, userMessage) {
  const executor = await getExecutor();
  const history = sessions.get(sessionId) ?? [];

  const result = await executor.invoke({
    input: userMessage,
    chat_history: history,
  });

  history.push(new HumanMessage(userMessage));
  history.push(new AIMessage(result.output));
  sessions.set(sessionId, history.slice(-20)); // keep last 20 turns

  return result.output;
}
