import { NextResponse } from "next/server";
import { isValidAdminToken, createServiceClient } from "@/lib/supabase";

function csvEscape(value: unknown) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!isValidAdminToken(url.searchParams.get("token"))) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .select("*, survey_generated_messages(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = [
    "created_at",
    "name",
    "whatsapp",
    "email",
    "audience_slug",
    "detected_profile",
    "interest_level",
    "urgency_score",
    "lead_status",
    "priority",
    "next_contact_at",
    "delivered_offer",
    "last_message_at",
    "internal_notes",
    "free_offer",
    "whatsapp_text",
  ];

  const rows = (data ?? []).map((row) => {
    const message = Array.isArray(row.survey_generated_messages)
      ? row.survey_generated_messages[0]
      : null;

    return [
      row.created_at,
      row.name,
      row.whatsapp,
      row.email,
      row.audience_slug,
      row.detected_profile,
      row.interest_level,
      row.urgency_score,
      row.lead_status,
      row.priority,
      row.next_contact_at,
      row.delivered_offer,
      row.last_message_at,
      row.internal_notes,
      message?.free_offer_suggestion,
      message?.whatsapp_text,
    ]
      .map(csvEscape)
      .join(",");
  });

  return new Response([headers.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=jornada-personal-extrema-respostas.csv",
    },
  });
}
