import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkQuota } from "@/lib/quota";
import { agentRouter, estimateCostUsd } from "@/lib/ai/client";
import { HOOK_SYSTEM_PROMPT, buildHookUserPrompt } from "@/lib/ai/prompts/hook";
import {
  hookGenerateSchema,
  hookGenerateOutput,
  type HookGenerateOutput,
} from "@/lib/validations/hook";

const MODEL = "anthropic/claude-3-5-haiku-20241022";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = hookGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const plan = ((session.user as Record<string, unknown>).plan as string) ?? "FREE";
    const quota = await checkQuota(session.user.id, plan, "hook");
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason, resetAt: quota.resetAt }, { status: 429 });
    }

    const { topic, niche, tone, platform, audience } = parsed.data;
    const startTime = Date.now();

    let rawContent: string;
    let tokensIn = 0;
    let tokensOut = 0;

    try {
      const response = await agentRouter.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: HOOK_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildHookUserPrompt({ topic, niche, tone, platform, audience }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 1500,
      });

      rawContent = response.choices[0].message.content ?? "{}";
      tokensIn = response.usage?.prompt_tokens ?? 0;
      tokensOut = response.usage?.completion_tokens ?? 0;
    } catch (aiError) {
      console.error("AI call failed:", aiError);
      return NextResponse.json(
        { error: "Gagal generate hook. Coba lagi dalam beberapa detik." },
        { status: 503 }
      );
    }

    const latencyMs = Date.now() - startTime;
    const costUsd = estimateCostUsd(MODEL, tokensIn, tokensOut);

    let result: HookGenerateOutput;
    try {
      const json = JSON.parse(rawContent);
      const validated = hookGenerateOutput.safeParse(json);
      if (!validated.success) {
        // Kadang AI return kurang dari 10, tetap pakai hasilnya
        result = { hooks: (json.hooks ?? []).slice(0, 10) };
      } else {
        result = validated.data;
      }
    } catch {
      return NextResponse.json(
        { error: "Format respons AI tidak valid. Coba lagi." },
        { status: 500 }
      );
    }

    // Simpan ke DB secara paralel (tidak block response)
    const [generation] = await Promise.all([
      prisma.generation.create({
        data: {
          userId: session.user.id,
          type: "hook",
          input: { topic, niche, tone, platform, audience },
          output: result,
        },
      }),
      prisma.usageLog.create({
        data: {
          userId: session.user.id,
          feature: "hook",
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
    console.error("Hook generation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 });
  }
}
