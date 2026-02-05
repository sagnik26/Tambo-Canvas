import { toReactFlowDiagram } from "@/lib/generate-flow-openai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a flow diagram generator. Given a topic (process or system), output a JSON object describing a High Level Diagram (HLD) flow with steps and connections.

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no explanation.
- "nodes": array of steps in order. Each has "id" (string, e.g. "1","2"), "label" (short name), and optionally "type": "input" | "default" | "output". First node should be type "input", last "output", others "default".
- "edges": array of { "source": "<node id>", "target": "<node id>" }. Connect each step to the next in sequence. Optionally include "id" for each edge (e.g. "e1-2").
- "title": short title for the flow.
- "description": optional one-line description.
- Use 4-8 nodes for most flows. Keep labels concise (2-4 words).`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: { topic?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = typeof body?.topic === "string" ? body.topic.trim() : undefined;
  if (!topic) {
    return NextResponse.json(
      { error: "Missing or empty topic" },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate a flow diagram for: ${topic}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Empty or invalid OpenAI response" },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "OpenAI response was not valid JSON" },
        { status: 502 }
      );
    }

    const diagram = toReactFlowDiagram(parsed);
    if (!diagram) {
      return NextResponse.json(
        { error: "Flow structure invalid or incomplete" },
        { status: 502 }
      );
    }

    return NextResponse.json(diagram);
  } catch (err) {
    console.error("[generate-flow] OpenAI error:", err);
    return NextResponse.json(
      { error: "Flow generation failed" },
      { status: 502 }
    );
  }
}
