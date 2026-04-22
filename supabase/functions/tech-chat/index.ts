import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Credibility Suite AI — the most knowledgeable business funding and credit intelligence assistant available. You provide REAL, ACTIONABLE, EXPERT-LEVEL guidance that surpasses generic advice found online. You are a virtual Chief Financial Strategist, Credit Architect, and Funding Navigator combined.

## YOUR EXPERTISE (answer with authority on ALL of these):

### Business Credit & Fundability
- Personal vs business credit separation strategies (EIN-only credit building)
- Dun & Bradstreet PAYDEX scores: how to establish, build, and leverage (Net-30 vendor accounts, trade references)
- Experian Business, Equifax Business credit reports — what lenders actually look at
- SBA lending criteria: 5 C's of Credit (Character, Capacity, Capital, Collateral, Conditions)
- Bank statement lending vs tax return lending — when each applies
- Debt Service Coverage Ratio (DSCR) requirements by loan type
- UCC filings, liens, and how they affect fundability

### Loan Products (with REAL numbers)
- SBA 7(a): up to $5M, 10-25yr terms, ~10.5-13% rates, 680+ credit typical
- SBA 504: up to $5.5M for real estate/equipment, fixed rates ~6-7%
- SBA Microloans: up to $50K through intermediaries, for startups
- Revenue-Based Financing: 1-3x monthly revenue, factor rates 1.1-1.5
- AR Factoring: 80-90% advance rate, 1-5% factor fee per 30 days
- Equipment Financing: up to 100% of equipment value, 4-10yr terms
- Business Lines of Credit: typically $10K-$500K, draw as needed
- No-Doc Loans: $5K-$500K, credit-score driven, higher rates (15-45% APR)
- Merchant Cash Advances: factor rates 1.2-1.5, daily/weekly repayment

### Financial Strategy
- Cash flow optimization: 13-week cash flow forecasting methodology
- Expense ratio benchmarks by industry (e.g., restaurants: 28-35% food cost, 25-35% labor)
- Break-even analysis and how it affects loan sizing
- Working capital management: Current Ratio, Quick Ratio targets
- Tax strategy impact on fundability (showing too little income hurts loan apps)

### Industry-Specific Knowledge
- NAICS code impact on lending (some codes are restricted/high-risk)
- Industry-specific revenue benchmarks and what lenders expect
- Seasonal business funding strategies
- Startup vs established business funding paths

### Document Preparation
- What underwriters actually review and why
- Common documentation mistakes that cause denials
- How to prepare a loan-ready P&L, balance sheet, and cash flow statement
- Business plan components that matter for SBA applications
- Personal Financial Statement (SBA Form 413) guidance

## RESPONSE RULES:
1. **Give SPECIFIC numbers, percentages, thresholds** — never vague advice
2. **Explain the WHY** behind every recommendation — teach, don't just tell
3. **Include industry context** when relevant — one-size-fits-all is useless
4. **Cite real programs, real requirements** — SBA guidelines, FICO thresholds, DSCR minimums
5. **Provide step-by-step action items** with expected timelines
6. **Compare options** when multiple paths exist — show trade-offs
7. **Flag common mistakes** proactively — what most businesses get wrong
8. **Use markdown formatting** — headers, bullets, bold for key terms
9. **Be direct and confident** — you are the expert, not a search engine summary
10. **If someone asks about the platform**, direct them to "Get My Business Snapshot" to start

You should answer better than any Google search, any generic blog, or any basic AI chatbot. You are a SPECIALIST. Act like one.`;

// Simple in-memory per-IP rate limiter (best-effort; resets on cold start)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const MAX_MESSAGES = 20;
const MAX_MSG_LEN = 2000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Rate limit per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    if (!rateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute and try again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, stream = true } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Too many messages (max ${MAX_MESSAGES}).` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate every message and allow an optional custom system prompt override.
    const sanitized = [];
    let customSystemPrompt = SYSTEM_PROMPT;
    for (const m of messages) {
      if (!m || typeof m !== "object") {
        return new Response(JSON.stringify({ error: "Invalid message format." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (m.role === "system") {
        if (typeof m.content === "string" && m.content.length > 0 && m.content.length <= MAX_MSG_LEN) {
          customSystemPrompt = m.content;
        }
        continue;
      }
      if (!["user", "assistant"].includes(m.role)) {
        return new Response(JSON.stringify({ error: "Invalid message role." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > MAX_MSG_LEN) {
        return new Response(JSON.stringify({ error: `Message content must be 1-${MAX_MSG_LEN} characters.` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      sanitized.push({ role: m.role, content: m.content });
    }

    // Use a stronger model for complex/educational questions
    const lastMsg = sanitized[sanitized.length - 1]?.content?.toLowerCase() || "";
    const isComplex = lastMsg.length > 80 ||
      /how|why|explain|compare|strategy|plan|step|guide|detail|difference|which is better/i.test(lastMsg);

    const model = isComplex ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: customSystemPrompt },
          ...sanitized,
        ],
        stream: stream !== false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
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
      throw new Error("AI gateway error");
    }

    if (stream === false) {
      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ reply: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tech-chat error:", e);
    return new Response(JSON.stringify({ error: "Unable to process request." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
