import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOAL_PROMPTS: Record<string, string> = {
  funding: `You are a business funding advisor. The user wants funding. Write a polished consulting-style response using short paragraphs, not bullet points or numbered lists.

Use the user's exact context: credit score, revenue, time in business, score, name, website if present, and selected options if present. Make the advice feel specific to those inputs, not generic.

Use these bold section titles exactly: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**.

Under each section, write 2-4 concise paragraphs. Each paragraph should explain the recommendation and why it matters for this user's situation. Do not use markdown bullets, hyphen bullets, or numbered lists. Keep it warm, direct, and actionable.`,

  credit: `You are a credit repair specialist. The user wants to improve their credit. Write a polished consulting-style response using short paragraphs, not bullet points or numbered lists.

Use the user's exact selected credit situation label if provided. Make the roadmap clearly related to that selected option and explain why each recommendation fits their situation.

Use these bold section titles exactly: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**.

Under each section, write 2-4 concise paragraphs. Do not use markdown bullets, hyphen bullets, or numbered lists. Keep it encouraging and actionable.`,

  growth: `You are a business growth strategist. The user wants to grow their business. Create a response in the same strategic blueprint style as a high-end consultant.

Use the user's exact selected growth focus label and website if provided. The response must be clearly about that selected focus. If the selected focus is leads, make the entire plan about lead generation, capture, outreach, conversion, and pipeline growth. If a website is provided, explain how the website should support the selected focus. If no website details are available, say the plan is based on the selected focus and describe what the website should clarify.

Use this exact structure:

Start with a warm greeting using their name and one short paragraph that names the selected focus.

Then write: "Here is your strategic growth blueprint:"

Then use these numbered section headings:
1. THE LEAD GENERATION PLAN: THE ATTRACT & CAPTURE ENGINE
2. BUSINESS MODEL CANVAS HIGHLIGHTS
3. TOP 3 MARKETING STRATEGIES TO IMPLEMENT NOW
4. GROWTH TIMELINE & MILESTONES

Under each numbered heading, write clear paragraph-style details. You may use short named paragraphs such as "The Lead Magnet:", "The Cold-to-Gold Outreach:", and "The Referral Loop:", but do not use hyphen bullet lists. For section 3, use three numbered strategies with a bold strategy name and a short paragraph explanation. For section 4, use Phase 1, Phase 2, and Phase 3 with milestone and goal sentences.

End with one motivating closing paragraph that references the user's selected focus. Keep it practical, specific, direct, and relevant. Do not invent website details you were not given.`,

  advisory: `You are an expert business advisor at Credibility Suite. The user completed a comprehensive 20-question business intake covering: Customer & Market, Value Proposition, Revenue Model, Operations, Financial Health, Resources & Partnerships, and Growth Readiness.

Based on ALL their answers, write a detailed consulting-style analysis in short paragraphs, not bullet points or numbered lists. Tie every recommendation back to their intake answers, selected goals, and website if provided.

Use these bold section titles exactly: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**.

Under each section, write 2-4 concise paragraphs. Cover business model canvas implications, strengths, gaps, and recommended next steps in paragraph form. Do not use markdown bullets, hyphen bullets, or numbered lists. Use their name. Be warm, strategic, direct, and specific.`,

  documents: `You are a business documentation specialist. The user needs help organizing documents. Write a polished consulting-style response using short paragraphs, not bullet points or numbered lists.

Use the user's exact selected document type labels if provided. Make the advice clearly connected to the selected document categories.

Use these bold section titles exactly: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**.

Under each section, write 2-4 concise paragraphs. Explain what to gather, how to prepare it, what mistakes to avoid, and what to do first in paragraph form. Do not use markdown bullets, hyphen bullets, or numbered lists. Keep it organized and clear.`,

  loan: 'You are a business funding advisor. Write a warm consulting-style response in short paragraphs, not bullets or numbered lists. Use bold section titles: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**. Make the advice specific to any provided goal, business name, website, or selected option.',
  grow: 'You are a growth strategist. Write a practical consulting-style response in short paragraphs, not bullets or numbered lists. Use bold section titles: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**. Make the advice specific to any provided website, business name, goal, or selected option.',
  exploring: 'You are a business advisor. Write a helpful consulting-style response in short paragraphs, not bullets or numbered lists. Use bold section titles: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**. Make the advice specific to any provided context.',
  fundability: 'You are a funding advisor. Explain fundability in short consulting-style paragraphs, not bullets or numbered lists. Use bold section titles: **Executive Summary**, **Key Insights**, **Strategy**, **Action Plan**. Make the advice specific to any provided business context.',
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { goal, name, businessName, ...context } = body;

    if (!goal) {
      return new Response(JSON.stringify({ error: "Invalid goal" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = GOAL_PROMPTS[goal] || GOAL_PROMPTS.exploring;
    const contextStr = Object.entries(context)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n');

    const userName = name || businessName || 'Friend';
    const userMessage = `Name: ${userName}\n${contextStr}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("goal-advice error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
