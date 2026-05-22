import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest, createServiceClient } from "@/lib/supabase";

function csvEscape(value: unknown) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
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
    "conversion_status",
    "priority",
    "next_contact_at",
    "delivered_offer",
    "last_message_at",
    "followup_count",
    "last_followup_suggestion",
    "program_suggested",
    "converted_at",
    "weekly_report_bucket",
    "lost_reason",
    "internal_notes",
    "narrated_context",
    "known_history_summary",
    "next_journey_step",
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
      row.conversion_status,
      row.priority,
      row.next_contact_at,
      row.delivered_offer,
      row.last_message_at,
      row.followup_count,
      row.last_followup_suggestion,
      row.program_suggested,
      row.converted_at,
      row.weekly_report_bucket,
      row.lost_reason,
      row.internal_notes,
      row.narrated_context,
      row.known_history_summary,
      row.next_journey_step,
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
