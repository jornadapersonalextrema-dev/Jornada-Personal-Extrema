import { NextResponse } from "next/server";
import { buildFollowupSuggestion, isFollowupOverdue, isWithoutRecentMessage } from "@/lib/automation-rules";
import { isValidAdminToken, createServiceClient } from "@/lib/supabase";
import type { LeadSummary } from "@/lib/types";

const leadSelect =
  "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,converted_at,conversion_status,program_suggested,followup_count,last_followup_suggestion,weekly_report_bucket,lost_reason,created_at";

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!isValidAdminToken(url.searchParams.get("token"))) {
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
  const pending = leads
    .filter((lead) => {
      if (lead.lead_status === "Virou aluno" || lead.lead_status === "Arquivado") return false;
      return isFollowupOverdue(lead) || isWithoutRecentMessage(lead, 7) || lead.lead_status === "Novo";
    })
    .map((lead) => ({
      lead,
      suggestion: buildFollowupSuggestion(lead),
    }));

  return NextResponse.json({
    total: pending.length,
    pending,
  });
}
