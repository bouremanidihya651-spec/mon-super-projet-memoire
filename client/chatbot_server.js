import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es Voyageo, un assistant voyage expert et passionné. Tu aides les utilisateurs à découvrir leurs prochaines destinations de voyage.

Ton rôle :
- Suggérer des destinations personnalisées selon les préférences (budget, climat, type de voyage, durée)
- Fournir des informations pratiques : meilleure saison, budget estimé, activités incontournables
- Donner des conseils de voyage utiles (visa, santé, culture locale)
- Être enthousiaste et inspirant tout en restant précis et utile

Style de réponse :
- Réponds en français
- Sois concis mais informatif
- Utilise des emojis avec modération pour rendre les réponses agréables
- Structure tes réponses avec des titres et listes quand approprié
- Propose 2-3 destinations maximum par réponse pour ne pas submerger l'utilisateur

Quand tu suggères une destination, mentionne :
- Le nom et le pays
- Pourquoi c'est adapté à la demande
- La meilleure période pour y aller
- Une estimation du budget
- 2-3 activités phares`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: false, // Changé à false pour simplifier la gestion de la réponse
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});