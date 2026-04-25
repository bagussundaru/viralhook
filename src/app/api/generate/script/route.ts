import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkQuota } from "@/lib/quota";
import { agentRouter, estimateCostUsd } from "@/lib/ai/client";
import { SCRIPT_SYSTEM_PROMPT, buildScriptUserPrompt } from "@/lib/ai/prompts/script";
import {
  scriptGenerateSchema,
  scriptGenerateOutput,
  type ScriptGenerateOutput,
} from "@/lib/validations/script";

const MODEL = "anthropic/claude-sonnet-4";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = scriptGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const plan = ((session.user as Record<string, unknown>).plan as string) ?? "FREE";
    const quota = await checkQuota(session.user.id, plan, "script");
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason, resetAt: quota.resetAt }, { status: 429 });
    }

    const data = parsed.data;
    const startTime = Date.now();

    let rawContent: string;
    let tokensIn = 0;
    let tokensOut = 0;

    try {
      const response = await agentRouter.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SCRIPT_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildScriptUserPrompt({
              hook: data.hook,
              duration: data.duration,
              includeCta: data.includeCta,
              ctaType: data.ctaType ?? "follow",
              topic: data.topic,
              niche: data.niche,
              tone: data.tone,
              audience: data.audience,
            }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2500,
      });

      rawContent = response.choices[0].message.content ?? "{}";
      tokensIn = response.usage?.prompt_tokens ?? 0;
      tokensOut = response.usage?.completion_tokens ?? 0;
    } catch (aiError) {
      console.error("AI call failed:", aiError);
      return NextResponse.json(
        { error: "Gagal generate script. Coba lagi dalam beberapa detik." },
        { status: 503 }
      );
    }

    const latencyMs = Date.now() - startTime;
    const costUsd = estimateCostUsd(MODEL, tokensIn, tokensOut);

    let result: ScriptGenerateOutput;
    try {
      const json = JSON.parse(rawContent);
      const validated = scriptGenerateOutput.safeParse(json);
      result = validated.success ? validated.data : json;
    } catch {
      return NextResponse.json(
        { error: "Format respons AI tidak valid. Coba lagi." },
        { status: 500 }
      );
    }

    const [generation] = await Promise.all([
      prisma.generation.create({
        data: {
          userId: session.user.id,
          type: "script",
          input: {
            hook: data.hook,
            topic: data.topic,
            niche: data.niche,
            tone: data.tone,
            audience: data.audience,
            duration: data.duration,
            includeCta: data.includeCta,
            ctaType: data.ctaType,
          },
          output: result as object,
        },
      }),
      prisma.usageLog.create({
        data: {
          userId: session.user.id,
          feature: "script",
          model: MODEL,
          tokensIn,
          tokensOut,
          costUsd,
          latencyMs,
        },
      }),
    ]);

    return NextResponse.json({ ...result, generationId: generation.id });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 });
  }
}
