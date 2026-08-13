import { NextRequest, NextResponse } from "next/server";
import { portfolioKnowledge } from "./knowledge";

/**
 * Answers questions about the portfolio for the terminal's `ask` command.
 *
 * The point of the route is that the key stays here. Reading it from a
 * NEXT_PUBLIC_ variable in the browser, as this used to, inlines it into the
 * client bundle: it is in view-source on every page load and anyone can spend
 * the quota. Server-side it is never sent to the client at all.
 */

/**
 * A rolling alias rather than a pinned name. The version this replaced called
 * `gemini-2.5-flash-preview-09-2025`, which has since been retired, and a
 * pinned model returns 404 the day it goes: even `gemini-2.5-flash` is now
 * refused for keys that had not already used it. Set GEMINI_MODEL to pin.
 */
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
const TIMEOUT_MS = 15_000;
const MAX_QUESTION = 400;

/**
 * Crude per-IP throttle. In-memory, so on a serverless host it only holds for
 * the lifetime of one instance, and it is not a substitute for a real limiter.
 * It exists so a single visitor holding down enter cannot empty the quota.
 */
const RATE = { windowMs: 60_000, max: 8 };
const MAX_TRACKED_IPS = 500;
const hits = new Map<string, number[]>();

function pruneHits(now: number) {
  if (hits.size <= MAX_TRACKED_IPS) return;
  for (const [key, times] of hits) {
    const live = times.filter((t) => now - t < RATE.windowMs);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
    if (hits.size <= MAX_TRACKED_IPS) return;
  }
  for (const key of hits.keys()) {
    if (hits.size <= MAX_TRACKED_IPS) break;
    hits.delete(key);
  }
}

function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);

  if (recent.length >= RATE.max) {
    hits.set(ip, recent);
    pruneHits(now);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  pruneHits(now);
  return false;
}

/** Built here rather than shipped to the client, so the prompt stays private. */
function knowledge() {
  return JSON.stringify(portfolioKnowledge());
}

const SYSTEM = `You answer questions about David O. for the terminal on his portfolio site.

Rules:
- Answer only from the JSON below. If it is not in there, say you do not have that on file.
- Two or three sentences at most. Plain sentences, no markdown, no bullet points, no headings.
- Write plainly and factually. Do not roleplay as a hacker, an AI, or a computer.
- Never use em dashes or en dashes.

Data: ${knowledge()}`;

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "ask is offline: no API key configured on the server." },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  if (throttled(ip)) {
    return NextResponse.json(
      { error: "Too many questions in a row. Give it a minute." },
      { status: 429 }
    );
  }

  let question: unknown;
  try {
    ({ question } = await request.json());
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ error: "Ask an actual question." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return NextResponse.json(
      { error: `Question too long (max ${MAX_QUESTION} characters).` },
      { status: 400 }
    );
  }

  const abort = AbortSignal.timeout(TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: abort,
        body: JSON.stringify({
          contents: [{ parts: [{ text: question.trim() }] }],
          systemInstruction: { parts: [{ text: SYSTEM }] },
          generationConfig: { maxOutputTokens: 512, temperature: 0.4 },
        }),
      }
    );

    if (!response.ok) {
      // The upstream body can echo the key back in an error payload, so it is
      // logged and never returned.
      console.error("Gemini error", response.status, await response.text().catch(() => ""));
      return NextResponse.json(
        { error: `Upstream error (${response.status}).` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!answer) {
      return NextResponse.json({ error: "No answer came back." }, { status: 502 });
    }
    return NextResponse.json({ answer });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error("Gemini request failed", error);
    return NextResponse.json(
      { error: timedOut ? "Timed out waiting for an answer." : "Request failed." },
      { status: timedOut ? 504 : 502 }
    );
  }
}
