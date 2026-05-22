import { NextResponse } from "next/server";
import { isFollowupOverdue, isWithoutRecentMessage } from "@/lib/automation-rules";
import { conversionStatusFromLeadStatus, getConversionRate, isConvertedLead } from "@/lib/funnel";
import { isAuthorizedAdminRequest, createServiceClient } from "@/lib/supabase";
import type { LeadSummary } from "@/lib/types";

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

const leadSelect =
  "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,converted_at,conversion_status,program_suggested,followup_count,last_followup_suggestion,weekly_report_bucket,lost_reason,narrated_context,known_history_summary,next_journey_step,created_at";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select(leadSelect)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leads = (responses ?? []) as LeadSummary[];
  const ids = leads.map((item) => item.id);

  const { data: answers } = ids.length
    ? await supabase
        .from("survey_answers")
        .select("question_key,answer_value,answer_values,comment,response_id")
        .in("response_id", ids)
    : { data: [] };

  const flatAnswers = (answers ?? []).flatMap((answer) =>
    Array.isArray(answer.answer_values)
      ? answer.answer_values
      : [answer.answer_value].filter(Boolean),
  );

  const comments = (answers ?? [])
    .filter((answer) => answer.comment)
    .slice(0, 30);

  const overdueCount = leads.filter(isFollowupOverdue).length;
  const noMessageSevenDays = leads.filter((lead) => isWithoutRecentMessage(lead, 7)).length;
  const converted = leads.filter(isConvertedLead).length;

  const normalizedConversionStatuses = leads.map((lead) =>
    (lead.conversion_status ?? conversionStatusFromLeadStatus(lead.lead_status)) as string,
  );

  const byAudience = countBy(leads.map((item) => item.audience_slug as string));
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

  return NextResponse.json({
    total: leads.length,
    byAudience,
    byInterest: countBy(leads.map((item) => item.interest_level as string)),
    byPriority: countBy(leads.map((item) => (item.priority ?? "media") as string)),
    byConversionStatus: countBy(normalizedConversionStatuses),
    overdueCount,
    noMessageSevenDays,
    convertedCount: converted,
    conversionRate: getConversionRate(leads.length, converted),
    conversionByAudience,
    mostMarked: Object.entries(countBy(flatAnswers as string[]))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12),
    recentResponses: leads,
    comments,
    meetingSummary: `Até o momento, a pesquisa recebeu ${leads.length} respostas. Há ${overdueCount} lead(s) com próximo contato vencido, ${noMessageSevenDays} lead(s) sem mensagem recente e ${converted} conversão(ões). Use o dashboard semanal para priorizar contatos, validar quais públicos convertem melhor e manter a Jornada Personal Extrema fora do mar vermelho do treino genérico.`,
  });
}
