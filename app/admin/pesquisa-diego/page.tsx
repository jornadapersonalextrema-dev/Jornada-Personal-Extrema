"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { oceanBluePrinciples, playbooks, statusFlow } from "@/lib/journey-playbook";

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  audience_slug: string;
  detected_profile: string;
  interest_level: string;
  lead_status: string;
  created_at: string;
};

type Summary = {
  total: number;
  byAudience: Record<string, number>;
  byInterest: Record<string, number>;
  byPriority?: Record<string, number>;
  overdueCount?: number;
  mostMarked: [string, number][];
  recentResponses: Lead[];
  comments: Array<{ question_key: string; comment: string }>;
  meetingSummary: string;
};

function AdminPesquisaContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin/summary?token=${encodeURIComponent(token)}`,
        );

        const data = (await response.json()) as Summary | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Erro ao carregar resumo.",
          );
        }

        if (isMounted) {
          setSummary(data as Summary);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar resumo.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const bestAudience = useMemo(() => {
    if (!summary || Object.keys(summary.byAudience).length === 0) {
      return null;
    }

    return Object.entries(summary.byAudience).sort((a, b) => b[1] - a[1])[0];
  }, [summary]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">Central da Jornada</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Acompanhamento da pesquisa
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Use esta tela para entender onde está o maior potencial da Jornada
            Personal Extrema: dores mais frequentes, públicos mais promissores,
            leads quentes e próximos passos para não cair no mar vermelho do
            treino genérico.
          </p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <button
            className="btn-admin-secondary"
            type="button"
            onClick={() => setShowHelp(true)}
          >
            Como usar esta tela?
          </button>

          <Link
            className="btn-admin-secondary"
            href={`/admin/pesquisa-diego/leads?token=${encodeURIComponent(
              token,
            )}`}
          >
            Ver leads
          </Link>

          <a
            className="btn-admin-primary"
            href={`/api/admin/export?token=${encodeURIComponent(token)}`}
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {showHelp ? <AdminHelpModal onClose={() => setShowHelp(false)} /> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-5">
          <p className="label-pill">Fluxo recomendado</p>
          <h2 className="mt-3 text-2xl font-black">Da resposta ao aluno</h2>
          <div className="journey-flow mt-4">
            {statusFlow.map((status, index) => (
              <div key={status} className="journey-step">
                <span className="journey-step-number">{index + 1}</span>
                <span>{status}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            O objetivo é conduzir a pessoa por uma jornada consultiva: entender
            a dor, entregar valor gratuito, agendar diagnóstico e só então
            propor o programa adequado.
          </p>
        </div>

        <div className="card p-5">
          <p className="label-pill">Rotina do Diego</p>
          <h2 className="mt-3 text-2xl font-black">Uso prático no dia a dia</h2>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li><strong>1.</strong> Ver novos leads diariamente.</li>
            <li><strong>2.</strong> Priorizar alto interesse e comentários abertos.</li>
            <li><strong>3.</strong> Copiar mensagem e abrir WhatsApp.</li>
            <li><strong>4.</strong> Entregar a oferta gratuita certa.</li>
            <li><strong>5.</strong> Atualizar status após cada contato.</li>
          </ol>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? <p className="mt-6">Carregando...</p> : null}

      {summary ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <MetricCard label="Total de respostas" value={summary.total} />
            <MetricCard label="Leads alto interesse" value={summary.byInterest.alto ?? 0} />
            <MetricCard label="Leads médio interesse" value={summary.byInterest.medio ?? 0} />
            <MetricCard label="Leads baixo interesse" value={summary.byInterest.baixo ?? 0} />
            <MetricCard label="Prioridade alta" value={summary.byPriority?.alta ?? 0} />
            <MetricCard label="Contatos vencidos" value={summary.overdueCount ?? 0} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="text-2xl font-black">Respostas por público</h2>

              {bestAudience ? (
                <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
                  Público com maior volume até agora:{" "}
                  <strong>{bestAudience[0]}</strong> ({bestAudience[1]} respostas).
                  Use isso como sinal inicial, mas confirme também intenção e urgência.
                </p>
              ) : null}

              <div className="mt-4 space-y-2">
                {Object.entries(summary.byAudience).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between rounded-2xl bg-slate-100 p-3"
                  >
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}

                {Object.keys(summary.byAudience).length === 0 ? (
                  <p className="text-slate-600">Nenhuma resposta ainda.</p>
                ) : null}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-2xl font-black">Principais marcações</h2>

              <div className="mt-4 space-y-2">
                {summary.mostMarked.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-3 rounded-2xl bg-slate-100 p-3"
                  >
                    <span className="break-words">{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}

                {summary.mostMarked.length === 0 ? (
                  <p className="text-slate-600">Nenhuma marcação ainda.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="card p-5">
              <h2 className="text-2xl font-black">Resumo para reunião</h2>
              <p className="mt-3 rounded-2xl bg-slate-100 p-4 leading-7 text-slate-700">
                {summary.meetingSummary}
              </p>
            </div>

            <div className="card p-5">
              <h2 className="text-2xl font-black">Como manter Oceano Azul</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {oceanBluePrinciples.map((principle) => (
                  <div key={principle.title} className="rounded-2xl bg-slate-100 p-4">
                    <p className="font-black">{principle.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-black">Playbook rápido por público</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {playbooks.map((playbook) => (
                <details key={playbook.audienceSlug} className="rounded-2xl bg-slate-100 p-4">
                  <summary className="cursor-pointer font-black">
                    {playbook.label}
                  </summary>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                    <p><strong>Ângulo:</strong> {playbook.oceanBlueAngle}</p>
                    <p><strong>Oferta gratuita:</strong> {playbook.freeOffer}</p>
                    <p><strong>Programa natural:</strong> {playbook.nextProgram}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-black">Comentários abertos</h2>

            <div className="mt-4 space-y-2">
              {summary.comments.length === 0 ? (
                <p className="text-slate-600">Nenhum comentário ainda.</p>
              ) : (
                summary.comments.map((comment, index) => (
                  <p
                    key={`${comment.question_key}-${index}`}
                    className="rounded-2xl bg-slate-100 p-3 text-sm"
                  >
                    <strong>{comment.question_key}:</strong> {comment.comment}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function AdminHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-3 backdrop-blur sm:items-center sm:justify-center">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-5 text-slate-950 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-pill">Ajuda da Jornada</p>
            <h2 className="mt-3 text-2xl font-black">
              Como usar o painel sem cair no mar vermelho
            </h2>
          </div>
          <button className="btn-admin-secondary" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">1. Leia sinais de mercado</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Não escolha o produto apenas pelo volume de respostas. Compare volume,
              urgência, interesse, comentário aberto e facilidade de contato.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">2. Priorize conversas certas</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Leads de alto interesse e dor clara devem receber mensagem em até
              24 horas, sempre com uma oferta gratuita específica.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">3. Venda jornada, não aula</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A proposta da Jornada Personal Extrema é diagnóstico, plano,
              acompanhamento e evolução. Não comece a conversa falando de preço.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">4. Atualize o funil</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cada contato precisa virar status. Isso mostra quais públicos
              convertem melhor e quais ofertas geram mais continuidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPesquisaFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">Admin</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">
        Acompanhamento da pesquisa
      </h1>
      <p className="mt-6">Carregando...</p>
    </section>
  );
}

export default function AdminPesquisaPage() {
  return (
    <main className="admin-shell">
      <Header />
      <Suspense fallback={<AdminPesquisaFallback />}>
        <AdminPesquisaContent />
      </Suspense>
    </main>
  );
}
