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

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsv(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });
}

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

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { csvText?: string };
  const rows = parseCsv(body.csvText ?? "");

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "CSV vazio ou sem linhas de dados." },
      { status: 400 },
    );
  }

  const payloads = rows
    .map((row) => normalizeClientPayload(row))
    .filter((row) => row.full_name)
    .map((row) => {
      const suggestionInput = buildSuggestionInput(row);

      return removeUndefinedValues({
        ...row,
        suggested_program:
          row.suggested_program ?? suggestProgramForClient(suggestionInput),
        next_journey_step:
          row.next_journey_step ?? buildNextJourneyStep(suggestionInput),
        tech_opportunities:
          row.tech_opportunities ?? buildTechOpportunities(suggestionInput),
      });
    });

  if (payloads.length === 0) {
    return NextResponse.json(
      { error: "Nenhum aluno com nome foi encontrado no CSV." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("journey_clients")
    .insert(payloads)
    .select("id,full_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    imported: data?.length ?? 0,
    students: data ?? [],
  });
}