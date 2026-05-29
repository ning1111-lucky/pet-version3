import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const safePrompt = prompt.slice(0, 3200);
    const enhancedPrompt = `${safePrompt}, soft pixel art, warm creamy colors, dark brown outlines, cute collectible music pet, no text, no watermark, centered full-body character, transparent or warm cream background`;

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Date.now() % 2147483647;

    const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=zimage&width=1024&height=1024&seed=${seed}&enhance=true&nologo=true`;

    return res.status(200).json({
      imageUrl,
      provider: "pollinations",
      seed
    });
  } catch (error: any) {
    console.error("Generate weekly pet with Pollinations error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate weekly pet image with Pollinations."
    });
  }
}


