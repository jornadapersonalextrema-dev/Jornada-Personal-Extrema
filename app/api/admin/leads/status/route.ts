import { NextResponse } from "next/server";
import { isValidAdminToken, createServiceClient } from "@/lib/supabase";

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  if (!isValidAdminToken(url.searchParams.get("token"))) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !body.status) return NextResponse.json({ error: "ID e status são obrigatórios." }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase.from("survey_responses").update({ lead_status: body.status }).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
