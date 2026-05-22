import { NextResponse } from "next/server";
import { buildFollowupSuggestion, getNextContactDate, getWeeklyBucket, isFollowupOverdue, isWithoutRecentMessage } from "@/lib/automation-rules";
import { createServiceClient } from "@/lib/supabase";
import type { LeadSummary } from "@/lib/types";

const leadSelect =
  "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,converted_at,conversion_status,program_suggested,followup_count,last_followup_suggestion,weekly_report_bucket,lost_reason,created_at";

function isAuthorized(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("authorization")?.replace("Bearer ", "");
  return Boolean(process.env.CRON_SECRET && token === process.env.CRON_SECRET);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .select(leadSelect)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leads = (data ?? []) as LeadSummary[];
  const candidates = leads.filter((lead) => {
    if (lead.lead_status === "Virou aluno" || lead.lead_status === "Arquivado") return false;
    return isFollowupOverdue(lead) || isWithoutRecentMessage(lead, 7);
  });

  let updated = 0;

  for (const lead of candidates) {
    const suggestion = buildFollowupSuggestion(lead);

    const { error: updateError } = await supabase
      .from("survey_responses")
      .update({
        priority: suggestion.priority,
        last_followup_suggestion: suggestion.whatsappText,
        next_contact_at: lead.next_contact_at ?? getNextContactDate(suggestion.recommendedNextContactDays),
        program_suggested: lead.program_suggested,
        weekly_report_bucket: getWeeklyBucket(lead),
      })
      .eq("id", lead.id);

    if (!updateError) {
      updated += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    checked: leads.length,
    candidates: candidates.length,
    updated,
  });
}
