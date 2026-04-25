import OpenAI from "openai";

// Agent Router pakai OpenAI-compatible SDK
export const agentRouter = new OpenAI({
  apiKey: process.env.AGENT_ROUTER_API_KEY!,
  baseURL: process.env.AGENT_ROUTER_BASE_URL || "https://openrouter.ai/api/v1",
});

// Harga per 1M token (USD) — untuk estimasi cost
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "anthropic/claude-3-5-haiku-20241022": { input: 0.8, output: 4.0 },
  "anthropic/claude-sonnet-4": { input: 3.0, output: 15.0 },
  "meta-llama/llama-3.1-8b-instruct": { input: 0.055, output: 0.055 },
};

export function estimateCostUsd(model: string, tokensIn: number, tokensOut: number): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (tokensIn / 1_000_000) * pricing.input + (tokensOut / 1_000_000) * pricing.output;
}
