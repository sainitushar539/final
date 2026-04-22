import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Channel = "email" | "sms";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { channel, to, subject, body } = await req.json();
    if (!channel || !["email", "sms"].includes(channel)) {
      return new Response(JSON.stringify({ error: "Invalid channel" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!to || !body) {
      return new Response(JSON.stringify({ error: "Destination and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: settings, error: settingsError } = await supabase
      .from("communication_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      throw settingsError;
    }

    if (!settings) {
      return new Response(JSON.stringify({
        error: "Communication settings missing. Add SMTP/Twilio credentials in Settings.",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (channel === "email") {
      const missing = [
        !settings.smtp_host && "SMTP host",
        !settings.smtp_port && "SMTP port",
        !settings.smtp_user && "SMTP username",
        !settings.smtp_password && "SMTP password",
        !settings.smtp_from_email && "From email",
      ].filter(Boolean);

      if (missing.length > 0) {
        return new Response(JSON.stringify({
          error: `Email credentials missing: ${missing.join(", ")}. Add them in Settings.`,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: Boolean(settings.smtp_secure),
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_password,
        },
      });

      await transporter.sendMail({
        from: settings.smtp_from_name
          ? `${settings.smtp_from_name} <${settings.smtp_from_email}>`
          : settings.smtp_from_email,
        to,
        subject: subject || "Credibility Suite message",
        text: body,
      });

      return new Response(JSON.stringify({ ok: true, channel: "email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const missing = [
      !settings.twilio_account_sid && "Twilio Account SID",
      !settings.twilio_auth_token && "Twilio Auth Token",
      !settings.twilio_from_number && "Twilio phone number",
    ].filter(Boolean);

    if (missing.length > 0) {
      return new Response(JSON.stringify({
        error: `SMS credentials missing: ${missing.join(", ")}. Add them in Settings.`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.set("To", to);
    formData.set("From", settings.twilio_from_number);
    formData.set("Body", body);

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!twilioRes.ok) {
      const errText = await twilioRes.text();
      throw new Error(`Twilio error: ${errText}`);
    }

    return new Response(JSON.stringify({ ok: true, channel: "sms" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
