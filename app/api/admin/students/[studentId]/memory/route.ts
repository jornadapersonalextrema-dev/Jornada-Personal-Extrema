import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest, createServiceClient } from "@/lib/supabase";
import { buildNextJourneyStep, buildTechOpportunities, suggestProgramForClient } from "@/lib/student-journey";

type Params = { params: Promise<{ studentId: string }> };

type Body = {
  diegoMemoryNotes?: string | null;
  audioTranscription?: string | null;
  structuredSummary?: string | null;
};

export async function PATCH(request: Request, context: Params) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const { studentId } = await context.params;
  const body = (await request.json()) as Body;

  const supabase = createServiceClient();
  const { data: current, error: readError } = await supabase
    .from("journey_clients")
    .select("*")
    .eq("id", studentId)
    .single();

  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const merged = {
    ...current,
    diego_memory_notes: body.diegoMemoryNotes ?? current.diego_memory_notes,
    audio_transcription: body.audioTranscription ?? current.audio_transcription,
    structured_summary: body.structuredSummary ?? current.structured_summary,
  };

  const update = {
    diego_memory_notes: merged.diego_memory_notes,
    audio_transcription: merged.audio_transcription,
    structured_summary: merged.structured_summary,
    suggested_program: suggestProgramForClient(merged),
    next_journey_step: buildNextJourneyStep(merged),
    tech_opportunities: buildTechOpportunities(merged),
  };

  const { data, error } = await supabase
    .from("journey_clients")
    .update(update)
    .eq("id", studentId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, student: data });
}
