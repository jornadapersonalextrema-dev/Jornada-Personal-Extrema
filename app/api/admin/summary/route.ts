import { NextResponse } from "next/server";
import { isValidAdminToken, createServiceClient } from "@/lib/supabase";

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!isValidAdminToken(url.searchParams.get("token"))) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select(
      "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (responses ?? []).map((item) => item.id);
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

  const overdueCount = (responses ?? []).filter((response) => {
    if (!response.next_contact_at) return false;
    return new Date(response.next_contact_at).getTime() < Date.now();
  }).length;

  return NextResponse.json({
    total: responses?.length ?? 0,
    byAudience: countBy((responses ?? []).map((item) => item.audience_slug as string)),
    byInterest: countBy((responses ?? []).map((item) => item.interest_level as string)),
    byPriority: countBy((responses ?? []).map((item) => (item.priority ?? "media") as string)),
    overdueCount,
    mostMarked: Object.entries(countBy(flatAnswers as string[]))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12),
    recentResponses: responses ?? [],
    comments,
    meetingSummary: `Até o momento, a pesquisa recebeu ${responses?.length ?? 0} respostas. Os públicos e dores mais frequentes devem orientar a primeira oferta gratuita e o primeiro programa piloto da Jornada Personal Extrema. Há ${overdueCount} lead(s) com próximo contato vencido para priorizar.`,
  });
}
