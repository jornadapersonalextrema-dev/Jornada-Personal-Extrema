import { NextResponse } from "next/server";
import {
  isAuthorizedAdminRequest,
  createServiceClient,
} from "@/lib/supabase";
import {
  buildNextJourneyStep,
  buildTechOpportunities,
  normalizeClientPayload,
  suggestProgramForClient,
} from "@/lib/student-journey";
import type { JourneyClient } from "@/lib/types";

const studentSelect =
  "id,full_name,whatsapp,email,birth_date,age_range,city,neighborhood,current_status,client_type,training_location,weekly_frequency,usual_days,usual_time,main_goal,secondary_goals,known_limitations,health_notes,training_history,diego_memory_notes,audio_transcription,structured_summary,next_journey_step,suggested_program,tech_opportunities,personalized_survey_status,personalized_survey_link,last_contact_at,next_contact_at,priority,internal_notes,created_at,updated_at";

type Params = { params: Promise<{ studentId: string }> };

function removeUndefinedValues<T extends Record<string, unknown>>(input: T) {
  const output = { ...input };

  Object.keys(output).forEach((key) => {
    if (output[key] === undefined) {
      delete output[key];
    }
  });

  return output;
}

function buildSuggestionInput(
  payload: Record<string, string | null | undefined>,
): Partial<JourneyClient> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value ?? undefined]),
  ) as Partial<JourneyClient>;
}

export async function GET(request: Request, context: Params) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 },
    );
  }

  const { studentId } = await context.params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("journey_clients")
    .select(studentSelect)
    .eq("id", studentId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ student: data });
}

export async function PATCH(request: Request, context: Params) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 },
    );
  }

  const { studentId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const payload = normalizeClientPayload(body);

  const suggestionInput = buildSuggestionInput(payload);

  const update = removeUndefinedValues({
    ...payload,
    suggested_program:
      payload.suggested_program ?? suggestProgramForClient(suggestionInput),
    next_journey_step:
      payload.next_journey_step ?? buildNextJourneyStep(suggestionInput),
    tech_opportunities:
      payload.tech_opportunities ?? buildTechOpportunities(suggestionInput),
  });

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("journey_clients")
    .update(update)
    .eq("id", studentId)
    .select(studentSelect)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, student: data });
}