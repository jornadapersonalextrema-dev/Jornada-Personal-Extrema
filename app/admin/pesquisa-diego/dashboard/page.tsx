"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { buildFollowupSuggestion, isFollowupOverdue, isWithoutRecentMessage } from "@/lib/automation-rules";
import { conversionStages } from "@/lib/funnel";
import type { DashboardSummary, LeadSummary } from "@/lib/types";

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleDateString("pt-BR");
}

function DashboardContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin/dashboard?token=${encodeURIComponent(token)}`,
        );

        const data = (await response.json()) as DashboardSummary | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Erro ao carregar dashboard.",
          );
        }

        if (isMounted) {
          setDashboard(data as DashboardSummary);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const bestAudience = useMemo(() => {
    if (!dashboard) return null;
    return Object.entries(dashboard.conversionByAudience)
      .sort((a, b) => b[1].rate - a[1].rate || b[1].total - a[1].total)[0];
  }, [dashboard]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">Bloco 3 • Automação assistida</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Dashboard semanal e funil de conversão
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Use esta tela para responder às perguntas centrais da operação:
            quem chamar hoje, qual público converte melhor, onde há gargalo e
            qual próximo passo mantém a Jornada Personal Extrema em Oceano Azul.
          </p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link
            className="btn-admin-secondary"
            href={`/admin/pesquisa-diego?token=${encodeURIComponent(token)}`}
          >
            Painel
          </Link>
          <Link
            className="btn-admin-primary"
            href={`/admin/pesquisa-diego/leads?token=${encodeURIComponent(token)}`}
          >
            Ver leads
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? <p className="mt-6 text-slate-600">Carregando dashboard...</p> : null}

      {dashboard ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Total de leads" value={dashboard.total} />
            <MetricCard label="Novos na semana" value={dashboard.newThisWeek} />
            <MetricCard label="Contatados na semana" value={dashboard.contactedThisWeek} />
            <MetricCard label="Follow-ups vencidos" value={dashboard.overdueFollowups} highlight />
            <MetricCard label="Conversões" value={dashboard.converted} />
            <MetricCard label="Taxa geral" value={formatPercent(dashboard.conversionRate)} />
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-black">Resumo semanal para o Diego</h2>
            <p className="mt-3 rounded-2xl bg-slate-100 p-4 leading-7 text-slate-700">
              {dashboard.weeklySummary}
            </p>
            {bestAudience ? (
              <p className="mt-3 text-sm font-bold text-emerald-700">
                Público com melhor sinal de conversão: {bestAudience[0]} •{" "}
                {formatPercent(bestAudience[1].rate)} de conversão em{" "}
                {bestAudience[1].total} lead(s).
              </p>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="card p-5">
              <h2 className="text-2xl font-black">Funil de conversão</h2>
              <div className="mt-5 space-y-3">
                {dashboard.funnel.map((item) => {
                  const stage = conversionStages.find((stageItem) => stageItem.key === item.key);
                  return (
                    <div key={item.key} className="rounded-2xl bg-slate-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black">{item.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {stage?.description}
                          </p>
                        </div>
                        <strong className="text-2xl">{item.count}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-2xl font-black">Conversão por público</h2>
              <div className="mt-5 space-y-3">
                {Object.entries(dashboard.conversionByAudience).map(([audience, stats]) => (
                  <div key={audience} className="rounded-2xl bg-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">{audience}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          {stats.converted} conversão(ões) em {stats.total} lead(s)
                        </p>
                      </div>
                      <strong className="text-xl text-emerald-700">
                        {formatPercent(stats.rate)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <LeadList
              title="Quem chamar hoje"
              leads={dashboard.hotLeads}
              token={token}
              empty="Nenhum lead quente no momento."
            />
            <LeadList
              title="Leads parados"
              leads={dashboard.stalledLeads}
              token={token}
              empty="Nenhum lead parado há mais de 7 dias."
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? "border-amber-300 bg-amber-50" : ""}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function LeadList({
  title,
  leads,
  token,
  empty,
}: {
  title: string;
  leads: LeadSummary[];
  token: string;
  empty: string;
}) {
  return (
    <div className="card p-5">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-5 space-y-3">
        {leads.length === 0 ? <p className="text-sm text-slate-600">{empty}</p> : null}
        {leads.map((lead) => {
          const suggestion = buildFollowupSuggestion(lead);
          return (
            <div key={lead.id} className="rounded-2xl bg-slate-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-black">{lead.name}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {lead.audience_slug} • {lead.lead_status} • Próximo contato:{" "}
                    {formatDate(lead.next_contact_at)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {suggestion.title}: {suggestion.action}
                  </p>
                  {isFollowupOverdue(lead) ? (
                    <span className="mt-2 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                      Follow-up vencido
                    </span>
                  ) : null}
                  {isWithoutRecentMessage(lead, 7) ? (
                    <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                      Sem mensagem há 7+ dias
                    </span>
                  ) : null}
                </div>
                <Link
                  className="btn-admin-secondary"
                  href={`/admin/pesquisa-diego/leads?token=${encodeURIComponent(token)}`}
                >
                  Abrir CRM
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">Bloco 3</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">
        Dashboard semanal e funil de conversão
      </h1>
      <p className="mt-8 text-slate-600">Carregando dashboard...</p>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <main className="admin-shell">
      <Header />
      <Suspense fallback={<DashboardFallback />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
