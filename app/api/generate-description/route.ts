import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { title, existingDescription } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Build the prompt dynamically
    let prompt = `You are a professional content writer for a perfume brand. Generate a human-like, descriptive, and emotionally engaging product description in plain text format.

Title: "${title}"
`;

    if (existingDescription && existingDescription.trim().length > 0) {
      prompt += `
Existing description (use for reference only, do NOT copy; enhance and humanize it): 
"${existingDescription}"

Requirements:
- Keep the core meaning but make it more human, storytelling, vivid, and emotionally appealing
- Keep the description concise: 3-5 sentences maximum
- Use rich sensory language and make the text flow naturally
- Use storytelling, imagery, and emotion
- Write in simple, engaging language that connects with the reader
`;
    } else {
      prompt += `
Requirements:
- Write as if you are experiencing the perfume yourself
- Include storytelling, sensory language, and vivid imagery
- Make it friendly, natural, and emotionally appealing
- Keep it concise: 3-5 sentences maximum
- Describe the scent, mood, and experience it creates
- Write in simple, engaging language
`;
    }

    prompt += `
Format Rules:
- Return PLAIN TEXT ONLY (no HTML, no markdown, no special formatting)
- No asterisks, no hyphens for lists, no hashtags
- Just natural flowing sentences
- Single paragraph or multiple short paragraphs separated by blank lines
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    console.log("Generated Description:", response.text);

    // Humanize the AI-generated text so it reads naturally and passes AI detectors
    const humanizePrompt = `You are a human content editor. Rewrite the following text so it sounds completely written by a real person, NOT by AI. 

Original text:
"${response.text}"

Humanization rules:
- Vary sentence lengths a lot: mix very short punchy sentences with longer flowing ones
- Add subtle personal touches like "honestly", "there's something about", "I can't help but", "you know that feeling when"
- Use casual contractions: "it's", "you'll", "don't", "won't", "there's"
- Occasionally start sentences with "And" or "But" like real people do
- Avoid overly polished or generic marketing phrases
- Break predictable sentence patterns - don't follow subject-verb-object every time
- Add a tiny imperfection or conversational aside
- Keep the same meaning, tone, and length (3-5 sentences)
- DO NOT use clichés like "elevate", "embark", "journey", "tapestry", "symphony", "captivating", "realm", "delve", "Moreover", "Furthermore"
- Write like you're telling a friend about this perfume, not writing ad copy
- Return PLAIN TEXT ONLY, no formatting
- Do NOT mention that you rewrote or humanized anything`;

    const humanizedResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: humanizePrompt,
    });

    const finalDescription = humanizedResponse.text?.trim() || response.text?.trim() || "";
    console.log("Humanized Description:", finalDescription);

    // Generate keywords from the title and description
    const keywordPrompt = `Based on this perfume product:
Title: "${title}"
Description: "${finalDescription}"

Generate 5-8 relevant SEO keywords as a comma-separated list. Only return the keywords, nothing else.`;

    const keywordResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: keywordPrompt,
    });

    // Generate alt text for the product image
    const altTextPrompt = `Write a concise, descriptive alt text for a product image for the following perfume:
Title: "${title}"
Description: "${finalDescription}"

- Describe the product visually and mention the bottle or packaging if relevant.
- 1 sentence, max 15 words.
- Do not use the words "image of" or "photo of".
- Only return the alt text, nothing else.`;

    const altTextResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: altTextPrompt,
    });

    return NextResponse.json({
      html: finalDescription,
      metaTitle: title,
      metaDescription: finalDescription.substring(0, 160),
      ogTitle: title,
      ogDescription: finalDescription.substring(0, 160),
      keywords: keywordResponse.text?.trim() ?? "",
      altText: altTextResponse.text?.trim() ?? "",
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Gemini API failed" },
      { status: 500 }
    );
  }
}