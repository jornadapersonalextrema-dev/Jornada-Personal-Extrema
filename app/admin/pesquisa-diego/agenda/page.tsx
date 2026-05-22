"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { adminFetch, buildAdminApiUrl } from "@/lib/client-admin";
import { buildFollowupSuggestion, isFollowupOverdue } from "@/lib/automation-rules";
import type { LeadSummary } from "@/lib/types";

type Summary = { recentResponses: LeadSummary[] };

function sameLocalDay(value: string | null | undefined, reference: Date) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AgendaContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAgenda() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminFetch("/api/admin/summary", token);
        const data = (await response.json()) as Summary | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data && data.error ? data.error : "Erro ao carregar agenda.");
        }

        if (active) setLeads((data as Summary).recentResponses ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar agenda.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadAgenda();

    return () => {
      active = false;
    };
  }, [token]);

  const agenda = useMemo(() => {
    const today = new Date();
    const overdue = leads.filter(isFollowupOverdue);
    const todayItems = leads.filter((lead) => sameLocalDay(lead.next_contact_at, today));
    const highPriority = leads.filter((lead) => (lead.priority ?? "media") === "alta" && lead.lead_status !== "Virou aluno" && lead.lead_status !== "Arquivado");

    return { overdue, todayItems, highPriority };
  }, [leads]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">Gestão de foco</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Agenda prática do Diego</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Esta tela organiza o que precisa de atenção hoje para reduzir perda de foco: contatos vencidos, próximos contatos do dia e leads de alta prioridade.
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link className="btn-admin-secondary" href={buildAdminApiUrl("/admin/pesquisa-diego", token)}>Painel</Link>
          <Link className="btn-admin-primary" href={buildAdminApiUrl("/admin/pesquisa-diego/leads", token)}>Abrir CRM</Link>
        </div>
      </div>

      {error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</p> : null}
      {isLoading ? <p className="mt-6 text-slate-600">Carregando agenda...</p> : null}

      {!isLoading ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <AgendaColumn title="1. Chamar primeiro" subtitle="Follow-ups vencidos" leads={agenda.overdue} token={token} />
          <AgendaColumn title="2. Fazer hoje" subtitle="Próximos contatos do dia" leads={agenda.todayItems} token={token} />
          <AgendaColumn title="3. Não deixar esfriar" subtitle="Prioridade alta" leads={agenda.highPriority} token={token} />
        </div>
      ) : null}
    </section>
  );
}

function AgendaColumn({ title, subtitle, leads, token }: { title: string; subtitle: string; leads: LeadSummary[]; token: string }) {
  return (
    <div className="card p-5">
      <p className="label-pill">{subtitle}</p>
      <h2 className="mt-3 text-2xl font-black">{title}</h2>
      <div className="mt-5 space-y-3">
        {leads.length === 0 ? <p className="text-sm leading-6 text-slate-600">Nada pendente nesta lista. Mantenha o CRM atualizado para a agenda continuar útil.</p> : null}
        {leads.slice(0, 10).map((lead) => {
          const suggestion = buildFollowupSuggestion(lead);
          return (
            <Link key={lead.id} href={buildAdminApiUrl("/admin/pesquisa-diego/leads", token)} className="block rounded-2xl bg-slate-100 p-4 hover:bg-slate-200">
              <p className="font-black text-slate-950">{lead.name}</p>
              <p className="mt-1 text-xs text-slate-600">{lead.audience_slug} • {lead.lead_status} • {formatDateTime(lead.next_contact_at)}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{suggestion.title}: {suggestion.action}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AgendaFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">Gestão de foco</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Agenda prática do Diego</h1>
      <p className="mt-8 text-slate-600">Carregando agenda...</p>
    </section>
  );
}

export default function AgendaPage() {
  return (
    <main className="admin-shell">
      <Header />
      <Suspense fallback={<AgendaFallback />}>
        <AdminAuthGuard>
          <AgendaContent />
        </AdminAuthGuard>
      </Suspense>
    </main>
  );
}
