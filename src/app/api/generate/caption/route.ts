import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkQuota } from "@/lib/quota";
import { agentRouter, estimateCostUsd } from "@/lib/ai/client";
import { CAPTION_SYSTEM_PROMPT, buildCaptionUserPrompt } from "@/lib/ai/prompts/caption";
import {
  captionGenerateSchema,
  captionGenerateOutput,
  type CaptionGenerateOutput,
} from "@/lib/validations/caption";

const MODEL = "anthropic/claude-3-5-haiku-20241022";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = captionGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const plan = ((session.user as Record<string, unknown>).plan as string) ?? "FREE";
    const quota = await checkQuota(session.user.id, plan, "caption");
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
          { role: "system", content: CAPTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildCaptionUserPrompt({
              topic: data.topic,
              niche: data.niche,
              tone: data.tone,
              platform: data.platform,
              audience: data.audience,
              hook: data.hook,
            }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 2000,
      });

      rawContent = response.choices[0].message.content ?? "{}";
      tokensIn = response.usage?.prompt_tokens ?? 0;
      tokensOut = response.usage?.completion_tokens ?? 0;
    } catch (aiError) {
      console.error("AI call failed:", aiError);
      return NextResponse.json(
        { error: "Gagal generate caption. Coba lagi dalam beberapa detik." },
        { status: 503 }
      );
    }

    const latencyMs = Date.now() - startTime;
    const costUsd = estimateCostUsd(MODEL, tokensIn, tokensOut);

    let result: CaptionGenerateOutput;
    try {
      const json = JSON.parse(rawContent);
      const validated = captionGenerateOutput.safeParse(json);
      result = validated.success ? validated.data : (json as CaptionGenerateOutput);
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
          type: "caption",
          input: {
            topic: data.topic,
            niche: data.niche,
            tone: data.tone,
            platform: data.platform,
            audience: data.audience,
            hook: data.hook,
          },
          output: result as object,
        },
      }),
      prisma.usageLog.create({
        data: {
          userId: session.user.id,
          feature: "caption",
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
    console.error("Caption generation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 });
  }
}
