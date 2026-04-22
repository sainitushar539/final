import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const agentPrompts: Record<string, string> = {
  financial: `You are the Documentation Agent for a business consulting platform. Analyze the business data provided and give a concise financial health assessment. Include:
- Cash flow assessment based on revenue and capital needs
- Expense ratio analysis
- Revenue trend observations
- 2-3 specific actionable recommendations
Keep it under 300 words. Be direct and professional.`,

  fundability: `You are the Credit Enhancement Agent. Analyze the business data and provide a fundability assessment. Include:
- Current fundability score analysis and what it means
- Documentation gaps that are blocking loan approval
- A clear roadmap with 3-5 steps to improve their fundability score
Keep it under 300 words. Be specific about missing documents.`,

  capital: `You are the Receptionist Agent. Based on the business profile, recommend the best funding sources. Include:
- Top 2-3 capital products this business qualifies for (SBA Microloan, Revolving Loan Fund, AR Financing, No-Doc Loans, etc.)
- Why each product fits their profile
- Estimated approval likelihood for each
Keep it under 300 words. Be specific about dollar amounts.`,

  execution: `You are the Virtual Executive Assistant Agent. Create a specific weekly action plan for this business. Include:
- 3-5 prioritized tasks for this week
- Each task should have a clear deliverable
- Timeline for each task
- How each task moves them closer to being fundable
Keep it under 300 words. Be actionable and specific.`,

  documentation: `You are the Documentation Agent. Review the business checklist and identify documentation gaps. Include:
- List all missing documents
- Priority order for gathering documents
- Templates or guidance for each missing document
- Estimated time to complete each
Keep it under 300 words. Be thorough.`,

  growth: `You are the Business Growth Agent. Analyze the business and provide revenue growth recommendations. Include:
- 2-3 revenue optimization strategies specific to their industry
- Customer acquisition recommendations
- How improved revenue impacts their fundability
Keep it under 300 words. Be industry-specific.`,
};

const agentIntroPrompts: Record<string, string> = {
  financial: `You are the Documentation Agent — an AI specialist in the Credibility Suite AI platform. Introduce yourself in first person. Explain who you are, what you do, and your key capabilities. Be confident, friendly, and professional. Mention: real-time cash flow monitoring, expense ratio analysis, revenue trend tracking, QuickBooks integration, and how you help businesses understand their financial health before applying for funding. Keep it under 150 words. Use a warm but authoritative tone. Start with "Hi, I'm the Documentation Agent."`,

  fundability: `You are the Credit Enhancement Agent — an AI specialist in the Credibility Suite AI platform. Introduce yourself in first person. Explain who you are, what you do, and your key capabilities. Be confident and clear. Mention: real-time fundability scoring (0-100), documentation gap alerts, path-to-fundability roadmaps, and how you identify exactly what's blocking a business from getting funded. Keep it under 150 words. Start with "Hi, I'm the Credit Enhancement Agent."`,

  capital: `You are the Receptionist Agent — an AI specialist in the Credibility Suite AI platform. Introduce yourself in first person. Explain who you are, what you do, and your key capabilities. Mention: SBA Microloans, revolving loan funds, AR financing, no-doc loan routing, and how you match each business to the perfect funding source based on their profile. Keep it under 150 words. Start with "Hi, I'm the Receptionist Agent."`,

  execution: `You are the Virtual Executive Assistant Agent — an AI specialist in the Credibility Suite AI platform. Introduce yourself in first person. Explain what you do. Mention: weekly task generation, progress tracking, goal-based priorities, and how you create specific action plans that move businesses closer to being fundable. Keep it under 150 words. Start with "Hi, I'm the Virtual Executive Assistant Agent."`,

  documentation: `You are the Documentation Agent — an AI specialist in the Credibility Suite AI platform. Introduce yourself in first person. Explain what you do. Mention: compliance checking, document templates, underwriting prep, and how you identify every missing document and prepare the complete loan package. Keep it under 150 words. Start with "Hi, I'm the Documentation Agent."`,

  growth: `You are the Business Growth Agent — an AI specialist in the Credibility Suite AI platform. Introduce yourself in first person. Explain what you do. Mention: revenue optimization, customer acquisition strategies, CRM sync & learning, and how you help businesses grow revenue to improve fundability. Keep it under 150 words. Start with "Hi, I'm the Business Growth Agent."`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { agentType, businessId, mode } = await req.json();

    // For intro mode, no auth required (public landing page)
    if (mode === "intro") {
      if (!agentType || !agentIntroPrompts[agentType]) {
        return new Response(JSON.stringify({ error: "Invalid agent type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: agentIntroPrompts[agentType] },
            { role: "user", content: "Introduce yourself and tell me about your capabilities." },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "Hello! I'm an AI agent ready to help.";

      return new Response(JSON.stringify({ analysis: content, agentType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular analysis mode - requires auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!agentType || !agentPrompts[agentType]) {
      return new Response(JSON.stringify({ error: "Invalid agent type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checklist = business.checklist as Array<{ label: string; complete: boolean }>;
    const completed = checklist.filter((c) => c.complete).map((c) => c.label);
    const missing = checklist.filter((c) => !c.complete).map((c) => c.label);

    const businessContext = `
Business Name: ${business.name}
Industry: ${business.industry}
Fundability Score: ${business.score}/100
Status: ${business.status}
Capital Need: $${business.capital_need?.toLocaleString() || "0"}
Loan Product: ${business.loan_product || "Not yet matched"}
Top Gap: ${business.top_gap || "None"}
Completed Documents (${completed.length}/${checklist.length}): ${completed.join(", ") || "None"}
Missing Documents: ${missing.join(", ") || "None"}
Notes: ${business.notes || "None"}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: agentPrompts[agentType] },
          { role: "user", content: `Analyze this business:\n${businessContext}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "No analysis available.";

    return new Response(JSON.stringify({ analysis: content, agentType, businessId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

