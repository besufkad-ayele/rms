import { GoogleGenerativeAI } from "@google/generative-ai";

export type KitchenAdvisorContext = {
  periodLabel: string;
  salesSummary: {
    grossRevenue: number;
    orderCount: number;
    grossProfit: number;
    foodCostPercent: number;
    tipsTotal: number;
  };
  topItems: Array<{
    name: string;
    qty: number;
    revenue: number;
    marginPercent: number;
    classification: string;
    salesGrowthPercent: number | null;
  }>;
  weakItems: Array<{
    name: string;
    qty: number;
    revenue: number;
    marginPercent: number;
    classification: string;
  }>;
  inventoryAlerts: Array<{
    name: string;
    stockQty: number;
    threshold: number;
    unit: string;
    estimatedDaysCover: number | null;
    costChangePercent: number | null;
  }>;
  channelMix: { dineIn: number; takeout: number; delivery: number };
};

function buildSystemPrompt(ctx: KitchenAdvisorContext): string {
  return `You are the kitchen & menu advisor for Keren Addis restaurant (Addis Ababa, Ethiopia, currency ETB).
Answer the owner's question using ONLY the live data below. Be practical and specific.
Respond in clear Markdown (headings, bullets, bold). Do not wrap the whole answer in a code fence.
If data is thin, say so and give cautious next steps.

## Period
${ctx.periodLabel}

## Sales snapshot
- Gross revenue: ETB ${ctx.salesSummary.grossRevenue}
- Orders: ${ctx.salesSummary.orderCount}
- Gross profit: ETB ${ctx.salesSummary.grossProfit}
- Food cost %: ${ctx.salesSummary.foodCostPercent}%
- Tips collected: ETB ${ctx.salesSummary.tipsTotal}

## Channel mix (revenue ETB)
- Dine-in: ${ctx.channelMix.dineIn}
- Takeout: ${ctx.channelMix.takeout}
- Delivery: ${ctx.channelMix.delivery}

## Top / strong items
${JSON.stringify(ctx.topItems, null, 2)}

## Weak / dog items
${JSON.stringify(ctx.weakItems, null, 2)}

## Inventory pressure (low stock / growth impact)
${JSON.stringify(ctx.inventoryAlerts, null, 2)}
`;
}

export async function askGeminiMarkdown(
  question: string,
  ctx: KitchenAdvisorContext
): Promise<{ ok: true; markdown: string } | { ok: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "GEMINI_API_KEY is not configured on the server.",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${buildSystemPrompt(ctx)}\n\n## Owner question\n${question.trim()}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    });

    const markdown = result.response.text()?.trim();
    if (!markdown) {
      return { ok: false, error: "Gemini returned an empty response." };
    }
    return { ok: true, markdown };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gemini request failed.";
    console.error("askGeminiMarkdown:", message);
    return { ok: false, error: message };
  }
}
