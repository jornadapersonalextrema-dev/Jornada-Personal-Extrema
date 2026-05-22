import { NextResponse } from "next/server";
import { isValidAdminToken, createServiceClient } from "@/lib/supabase";

type LeadUpdateBody = {
  id?: string;
  status?: string;
  priority?: string | null;
  internalNotes?: string | null;
  deliveredOffer?: string | null;
  nextContactAt?: string | null;
  lastMessageAt?: string | null;
};

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
  const url = new URL(request.url);

  if (!isValidAdminToken(url.searchParams.get("token"))) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const body = (await request.json()) as LeadUpdateBody;

  if (!body.id) {
    return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  const update: Record<string, string | null> = {};

  if (body.status !== undefined) update.lead_status = body.status;

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

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo informado para atualização." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .update(update)
    .eq("id", body.id)
    .select(
      "id,audience_slug,name,whatsapp,detected_profile,interest_level,urgency_score,lead_status,priority,next_contact_at,internal_notes,delivered_offer,last_message_at,created_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data });
}
