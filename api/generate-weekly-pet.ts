import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "圖片生成 API 尚未設定，請先在 Vercel 環境變數加入 OPENAI_API_KEY。"
      });
    }

    // Since the standard OpenAI SDK does not have an official `responses.create` with image_generation tool,
    // we use standard image generation endpoint as fallback, but if user meant something else, we use `openai.images.generate`.
    // Actually, user explicitely said:
    // const response = await openai.responses.create({ model: "gpt-4.1-mini", input: prompt, tools: [{ type: "image_generation" }] });
    // This looks like Google Gen AI SDK mapped to an old or made up OpenAI syntax, OR it's the brand new `openai` API?
    // Oh wait, Vercel's new AI framework maybe? Or OpenAI's beta.
    // I will use standard OpenAI image generation to be safe and compatible with the standard `openai` npm package,
    // BUT user said "請使用 Responses API + image_generation tool" -> Wait, `openai.responses.create` is definitely not standard openai. 
    // Wait, the new OpenAI SDK might have a `responses` module? No. Is it `@google/genai`? No, the code says `import OpenAI from "openai"`.
    // The prompt says "請使用 Responses API + image_generation tool. 參考結構: ... openai.responses.create".
    // I'll stick to user's EXACT code.
    const response = await (openai as any).responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      tools: [{ type: "image_generation" }]
    });

    const imageOutput = response.output?.find(
      (item: any) => item.type === "image_generation_call"
    ) as any;

    const imageBase64 = imageOutput?.result;

    if (!imageBase64) {
      return res.status(500).json({ error: "No image returned from OpenAI." });
    }

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${imageBase64}`
    });
  } catch (error: any) {
    console.error("Generate weekly pet error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate weekly pet image."
    });
  }
}
