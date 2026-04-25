import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkQuota } from "@/lib/quota";
import { agentRouter, estimateCostUsd } from "@/lib/ai/client";
import { VOICEOVER_SYSTEM_PROMPT, buildVoiceoverUserPrompt } from "@/lib/ai/prompts/voiceover";
import {
  voiceoverGenerateSchema,
  voiceoverGenerateOutput,
  type VoiceoverGenerateOutput,
} from "@/lib/validations/voiceover";

const MODEL = "anthropic/claude-3-5-haiku-20241022";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = voiceoverGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const plan = ((session.user as Record<string, unknown>).plan as string) ?? "FREE";
    const quota = await checkQuota(session.user.id, plan, "voiceover");
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
          { role: "system", content: VOICEOVER_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildVoiceoverUserPrompt({
              script: data.script,
              speed: data.speed,
              style: data.style,
            }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 2500,
      });

      rawContent = response.choices[0].message.content ?? "{}";
      tokensIn = response.usage?.prompt_tokens ?? 0;
      tokensOut = response.usage?.completion_tokens ?? 0;
    } catch (aiError) {
      console.error("AI call failed:", aiError);
      return NextResponse.json(
        { error: "Gagal optimasi voice-over. Coba lagi dalam beberapa detik." },
        { status: 503 }
      );
    }

    const latencyMs = Date.now() - startTime;
    const costUsd = estimateCostUsd(MODEL, tokensIn, tokensOut);

    let result: VoiceoverGenerateOutput;
    try {
      const json = JSON.parse(rawContent);
      const validated = voiceoverGenerateOutput.safeParse(json);
      result = validated.success ? validated.data : (json as VoiceoverGenerateOutput);
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
          type: "voiceover",
          input: { script: data.script, speed: data.speed, style: data.style },
          output: result as object,
        },
      }),
      prisma.usageLog.create({
        data: {
          userId: session.user.id,
          feature: "voiceover",
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
    console.error("Voiceover generation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 });
  }
}
