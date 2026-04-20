import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const contentPrompt = `You are a professional content writer for a luxury perfume brand blog. Based on the following topic/title, generate a complete blog post.

Topic/Title: "${title}"

Generate the following in JSON format:
{
  "title": "A refined, SEO-friendly blog title (improve the original if needed)",
  "excerpt": "A compelling 2-3 sentence summary that hooks readers (max 200 characters)",
  "content": "Full blog post content in HTML format with proper tags (<p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>). Include: introduction, 3-5 main sections with subheadings, and conclusion. Make it engaging, informative, and around 800-1200 words.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": "X min read"
}

Requirements:
- Content should be related to perfumes, fragrances, scents, or the luxury lifestyle
- Use sensory language and vivid descriptions
- Make it educational yet entertaining
- Include practical tips or insights where relevant
- Tags should be relevant keywords (5-8 tags)
- Calculate read time based on content length (average 200 words per minute)

Return ONLY valid JSON, no additional text or markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: contentPrompt,
    });

    const responseText = response.text?.trim() || "";
    
    // Clean up the response
    let cleanedResponse = responseText;
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    try {
      const blogData = JSON.parse(cleanedResponse);
      
      // Humanize the blog content so it sounds naturally human-written
      const humanizePrompt = `You are a human content editor. Rewrite the following blog HTML content so it sounds completely written by a real person, NOT by AI.

Original HTML content:
${blogData.content}

Humanization rules:
- Vary sentence lengths dramatically: mix very short punchy sentences with longer flowing ones
- Add subtle personal touches like "honestly", "there's something about", "I've found that", "you know that feeling when", "the thing is"
- Use casual contractions everywhere: "it's", "you'll", "don't", "won't", "there's", "I've"
- Occasionally start sentences with "And" or "But" like real people do
- Break up overly structured/formulaic paragraphs - real blog posts aren't perfectly organized
- Avoid overly polished or generic phrases
- DO NOT use clichés like "elevate", "embark", "journey", "tapestry", "symphony", "captivating", "realm", "delve", "Moreover", "Furthermore", "In conclusion", "In today's world"
- Write like you're genuinely passionate about perfume, not writing a textbook
- Add a conversational aside or personal opinion here and there
- Keep the same HTML structure and tags (<p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>)
- Keep similar length (800-1200 words)
- Do NOT mention that you rewrote or humanized anything
- Return ONLY the HTML content, nothing else`;

      const humanizedContent = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: humanizePrompt,
      });

      // Humanize the excerpt too
      const humanizeExcerptPrompt = `Rewrite this blog excerpt to sound like a real person wrote it, not AI. Keep it under 200 characters. Use casual language, contractions, and a personal tone. Avoid words like "elevate", "embark", "journey", "delve". Return ONLY the text, nothing else.

Original: "${blogData.excerpt}"`;

      const humanizedExcerpt = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: humanizeExcerptPrompt,
      });

      let finalContent = humanizedContent.text?.trim() || blogData.content || "";
      // Strip markdown wrappers if present
      if (finalContent.startsWith("```html")) finalContent = finalContent.slice(7);
      else if (finalContent.startsWith("```")) finalContent = finalContent.slice(3);
      if (finalContent.endsWith("```")) finalContent = finalContent.slice(0, -3);
      finalContent = finalContent.trim();

      return NextResponse.json({
        title: blogData.title || title,
        excerpt: humanizedExcerpt.text?.trim() || blogData.excerpt || "",
        content: finalContent,
        tags: Array.isArray(blogData.tags) ? blogData.tags.join(", ") : "",
        readTime: blogData.readTime || "5 min read"
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Handle rate limit error specifically
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
      // Extract retry delay if available
      const retryMatch = error.message?.match(/retry in (\d+)/i);
      const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 30;
      
      return NextResponse.json(
        { 
          error: `API rate limit exceeded. Please wait ${retrySeconds} seconds and try again. If this persists, the daily quota may be exhausted.`,
          retryAfter: retrySeconds
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "AI generation failed" },
      { status: 500 }
    );
  }
}