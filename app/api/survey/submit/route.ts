import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateDeepDiveMessage } from "@/lib/deep-dive";
import type { SurveyPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as SurveyPayload;

    if (!payload.name?.trim() || !payload.whatsapp?.trim() || !payload.audienceSlug?.trim()) {
      return NextResponse.json({ error: "Nome, WhatsApp e público são obrigatórios." }, { status: 400 });
    }

    const generated = generateDeepDiveMessage(payload);
    const supabase = createServiceClient();

    const { data: responseRow, error: responseError } = await supabase
      .from("survey_responses")
      .insert({
        audience_slug: payload.audienceSlug,
        name: payload.name,
        whatsapp: payload.whatsapp,
        email: payload.email || null,
        age_range: payload.ageRange || null,
        city: payload.city || null,
        source: payload.source || null,
        detected_profile: generated.detectedProfile,
        interest_level: generated.interestLevel,
        urgency_score: generated.urgencyScore,
        lead_status: "Novo",
      })
      .select("id")
      .single();

    if (responseError || !responseRow) {
      return NextResponse.json({ error: responseError?.message ?? "Erro ao salvar resposta." }, { status: 500 });
    }

    const answerRows = Object.entries(payload.answers ?? {}).map(([questionKey, answer]) => ({
      response_id: responseRow.id,
      question_key: questionKey,
      answer_value: Array.isArray(answer) ? null : String(answer ?? ""),
      answer_values: Array.isArray(answer) ? answer : null,
      comment: payload.comments?.[questionKey] || null,
    }));

    if (answerRows.length > 0) {
      const { error: answersError } = await supabase.from("survey_answers").insert(answerRows);
      if (answersError) return NextResponse.json({ error: answersError.message }, { status: 500 });
    }

    const { error: messageError } = await supabase.from("survey_generated_messages").insert({
      response_id: responseRow.id,
      message_type: "whatsapp_deep_dive",
      headline: generated.headline,
      whatsapp_text: generated.whatsappText,
      deep_dive_summary: generated.deepDiveSummary,
      free_offer_suggestion: generated.freeOffer,
      next_step_suggestion: generated.nextStep,
    });

    if (messageError) return NextResponse.json({ error: messageError.message }, { status: 500 });

    return NextResponse.json({ ok: true, id: responseRow.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
