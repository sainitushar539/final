import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, email, website, goals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Determine best path
    const priority = ['funding', 'credit', 'lead_gen', 'coaching', 'executive_assistant', 'documents', 'financial_health', 'business_plan', 'exploring'];
    const goalToPath: Record<string, string> = {
      funding: 'funding', financial_health: 'advisory', business_plan: 'advisory',
      lead_gen: 'growth', exploring: 'advisory', coaching: 'growth',
      documents: 'documentation', credit: 'credit', executive_assistant: 'vea',
    };

    let path = 'advisory';
    for (const p of priority) {
      if (goals?.includes(p)) { path = goalToPath[p]; break; }
    }

    // Generate a brief personalized routing message
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a warm business advisor. Write ONE short sentence (max 20 words) confirming the user's goal and encouraging them. Use their first name. No jargon." },
          { role: "user", content: `Name: ${name}. Goals: ${goals?.join(', ')}. Routed to: ${path} path.` },
        ],
      }),
    });

    let message = '';
    if (response.ok) {
      const data = await response.json();
      message = data.choices?.[0]?.message?.content || '';
    }

    return new Response(JSON.stringify({ path, message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-router error:", e);
    return new Response(JSON.stringify({ error: e.message, path: 'advisory', message: '' }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
