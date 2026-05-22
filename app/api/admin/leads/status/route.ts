import { NextResponse } from "next/server";
import { buildFollowupSuggestion, getNextContactDate, getSuggestedProgram, getWeeklyBucket } from "@/lib/automation-rules";
import { conversionStatusFromLeadStatus, leadStatusFromConversionStatus } from "@/lib/funnel";
import { isAuthorizedAdminRequest, createServiceClient } from "@/lib/supabase";
import type { LeadSummary } from "@/lib/types";

type LeadUpdateBody = {
  id?: string;
  status?: string;
  priority?: string | null;
  internalNotes?: string | null;
  deliveredOffer?: string | null;
  nextContactAt?: string | null;
  lastMessageAt?: string | null;
  convertedAt?: string | null;
  conversionStatus?: string | null;
  programSuggested?: string | null;
  followupCount?: number | null;
  lastFollowupSuggestion?: string | null;
  weeklyReportBucket?: string | null;
  lostReason?: string | null;
  narratedContext?: string | null;
  knownHistorySummary?: string | null;
  nextJourneyStep?: string | null;
  markMessageSentNow?: boolean;
  generateFollowup?: boolean;
};

const leadSelect =
  "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,converted_at,conversion_status,program_suggested,followup_count,last_followup_suggestion,weekly_report_bucket,lost_reason,narrated_context,known_history_summary,next_journey_step,created_at";

function nullableText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableDate(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null || value.trim().length === 0) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function PATCH(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as LeadUpdateBody;

  if (!body.id) {
    return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const update: Record<string, string | number | null> = {};

  if (body.status !== undefined) {
    update.lead_status = body.status;
    update.conversion_status = conversionStatusFromLeadStatus(body.status);
    if (body.status === "Virou aluno") {
      update.converted_at = new Date().toISOString();
    }
  }

  const priority = nullableText(body.priority);
  if (priority !== undefined) update.priority = priority;

  const internalNotes = nullableText(body.internalNotes);
  if (internalNotes !== undefined) update.internal_notes = internalNotes;

  const deliveredOffer = nullableText(body.deliveredOffer);
  if (deliveredOffer !== undefined) update.delivered_offer = deliveredOffer;

  const nextContactAt = nullableDate(body.nextContactAt);
  if (nextContactAt !== undefined) update.next_contact_at = nextContactAt;

  const lastMessageAt = nullableDate(body.lastMessageAt);
  if (lastMessageAt !== undefined) update.last_message_at = lastMessageAt;

  const convertedAt = nullableDate(body.convertedAt);
  if (convertedAt !== undefined) update.converted_at = convertedAt;

  const conversionStatus = nullableText(body.conversionStatus);
  if (conversionStatus !== undefined) {
    update.conversion_status = conversionStatus;
    if (body.status === undefined) {
      update.lead_status = leadStatusFromConversionStatus(conversionStatus);
    }
    if (conversionStatus === "converted" && body.convertedAt === undefined) {
      update.converted_at = new Date().toISOString();
    }
  }

  const programSuggested = nullableText(body.programSuggested);
  if (programSuggested !== undefined) update.program_suggested = programSuggested;

  const lastFollowupSuggestion = nullableText(body.lastFollowupSuggestion);
  if (lastFollowupSuggestion !== undefined) update.last_followup_suggestion = lastFollowupSuggestion;

  const weeklyReportBucket = nullableText(body.weeklyReportBucket);
  if (weeklyReportBucket !== undefined) update.weekly_report_bucket = weeklyReportBucket;

  const lostReason = nullableText(body.lostReason);
  if (lostReason !== undefined) update.lost_reason = lostReason;

  const narratedContext = nullableText(body.narratedContext);
  if (narratedContext !== undefined) update.narrated_context = narratedContext;

  const knownHistorySummary = nullableText(body.knownHistorySummary);
  if (knownHistorySummary !== undefined) update.known_history_summary = knownHistorySummary;

  const nextJourneyStep = nullableText(body.nextJourneyStep);
  if (nextJourneyStep !== undefined) update.next_journey_step = nextJourneyStep;

  if (typeof body.followupCount === "number") {
    update.followup_count = body.followupCount;
  }

  if (body.markMessageSentNow) {
    update.last_message_at = new Date().toISOString();
    update.followup_count = typeof body.followupCount === "number" ? body.followupCount : 0;
  }

  if (body.generateFollowup) {
    const { data: currentLead, error: readError } = await supabase
      .from("survey_responses")
      .select(leadSelect)
      .eq("id", body.id)
      .single();

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    const lead = { ...(currentLead as LeadSummary), ...update } as LeadSummary;
    const suggestion = buildFollowupSuggestion(lead);

    update.last_followup_suggestion = suggestion.whatsappText;
    update.priority = suggestion.priority;
    update.program_suggested = lead.program_suggested ?? getSuggestedProgram(lead.audience_slug);
    update.weekly_report_bucket = getWeeklyBucket(lead);
    update.next_contact_at = getNextContactDate(suggestion.recommendedNextContactDays);
    update.followup_count = (lead.followup_count ?? 0) + 1;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo informado para atualização." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("survey_responses")
    .update(update)
    .eq("id", body.id)
    .select(leadSelect)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data });
}
