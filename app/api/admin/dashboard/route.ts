import { NextResponse } from "next/server";
import { isFollowupOverdue, isWithoutRecentMessage } from "@/lib/automation-rules";
import { conversionStages, getConversionRate, isConvertedLead, isLostLead } from "@/lib/funnel";
import { isValidAdminToken, createServiceClient } from "@/lib/supabase";
import type { DashboardSummary, LeadSummary } from "@/lib/types";

const leadSelect =
  "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,converted_at,conversion_status,program_suggested,followup_count,last_followup_suggestion,weekly_report_bucket,lost_reason,created_at";

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function after(value: string | null | undefined, reference: Date) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= reference.getTime();
}

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
  const weekStart = startOfWeek();
  const converted = leads.filter(isConvertedLead).length;
  const lost = leads.filter(isLostLead).length;
  const overdueFollowups = leads.filter(isFollowupOverdue).length;
  const noMessageSevenDays = leads.filter((lead) => isWithoutRecentMessage(lead, 7)).length;

  const byAudience = countBy(leads.map((lead) => lead.audience_slug));
  const conversionByAudience = Object.fromEntries(
    Object.entries(byAudience).map(([audienceSlug, total]) => {
      const audienceLeads = leads.filter((lead) => lead.audience_slug === audienceSlug);
      const audienceConverted = audienceLeads.filter(isConvertedLead).length;
      return [
        audienceSlug,
        {
          total,
          converted: audienceConverted,
          rate: getConversionRate(total, audienceConverted),
        },
      ];
    }),
  );

  const funnel = conversionStages.map((stage) => ({
    key: stage.key,
    label: stage.label,
    count: leads.filter((lead) => {
      const status = lead.conversion_status ?? "";
      return status === stage.key || lead.lead_status === stage.leadStatus;
    }).length,
  }));

  const hotLeads = leads
    .filter((lead) => !isConvertedLead(lead) && lead.lead_status !== "Arquivado")
    .sort((a, b) => {
      const aScore = (a.priority === "alta" ? 100 : 0) + (a.urgency_score ?? 0) + (isFollowupOverdue(a) ? 50 : 0);
      const bScore = (b.priority === "alta" ? 100 : 0) + (b.urgency_score ?? 0) + (isFollowupOverdue(b) ? 50 : 0);
      return bScore - aScore;
    })
    .slice(0, 8);

  const stalledLeads = leads
    .filter((lead) => !isConvertedLead(lead) && !isLostLead(lead) && isWithoutRecentMessage(lead, 7))
    .slice(0, 8);

  const summary: DashboardSummary = {
    generatedAt: new Date().toISOString(),
    total: leads.length,
    newThisWeek: leads.filter((lead) => after(lead.created_at, weekStart)).length,
    contactedThisWeek: leads.filter((lead) => after(lead.last_message_at, weekStart)).length,
    diagnosticsScheduled: leads.filter((lead) => lead.lead_status === "Diagnóstico agendado").length,
    pilotsOffered: leads.filter((lead) => lead.lead_status === "Piloto oferecido").length,
    converted,
    lost,
    overdueFollowups,
    noMessageSevenDays,
    conversionRate: getConversionRate(leads.length, converted),
    byAudience,
    conversionByAudience,
    funnel,
    hotLeads,
    stalledLeads,
    weeklySummary: `Nesta semana, a Jornada Personal Extrema recebeu ${leads.filter((lead) => after(lead.created_at, weekStart)).length} novo(s) lead(s), teve ${leads.filter((lead) => after(lead.last_message_at, weekStart)).length} contato(s) registrado(s), ${overdueFollowups} follow-up(s) vencido(s) e taxa geral de conversão de ${getConversionRate(leads.length, converted)}%. Priorize leads de alta prioridade, follow-ups vencidos e públicos com maior taxa de conversão.`,
  };

  return NextResponse.json(summary);
}
