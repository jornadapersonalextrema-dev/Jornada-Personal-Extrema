"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";

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

  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-pill">Admin</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Acompanhamento da pesquisa
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            className="btn-secondary"
            href={`/admin/pesquisa-diego/leads?token=${encodeURIComponent(
              token,
            )}`}
          >
            Ver leads
          </Link>

          <a
            className="btn-primary"
            href={`/api/admin/export?token=${encodeURIComponent(token)}`}
          >
            Exportar CSV
          </a>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="card p-5">
              <p className="text-sm font-bold text-slate-500">
                Total de respostas
              </p>
              <p className="mt-2 text-4xl font-black">{summary.total}</p>
            </div>

            <div className="card p-5">
              <p className="text-sm font-bold text-slate-500">
                Leads alto interesse
              </p>
              <p className="mt-2 text-4xl font-black">
                {summary.byInterest.alto ?? 0}
              </p>
            </div>

            <div className="card p-5">
              <p className="text-sm font-bold text-slate-500">
                Leads médio interesse
              </p>
              <p className="mt-2 text-4xl font-black">
                {summary.byInterest.medio ?? 0}
              </p>
            </div>

            <div className="card p-5">
              <p className="text-sm font-bold text-slate-500">
                Leads baixo interesse
              </p>
              <p className="mt-2 text-4xl font-black">
                {summary.byInterest.baixo ?? 0}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="text-2xl font-black">Respostas por público</h2>

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
                    className="flex justify-between rounded-2xl bg-slate-100 p-3"
                  >
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}

                {summary.mostMarked.length === 0 ? (
                  <p className="text-slate-600">Nenhuma marcação ainda.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-black">Resumo para reunião</h2>
            <p className="mt-3 rounded-2xl bg-slate-100 p-4 leading-7 text-slate-700">
              {summary.meetingSummary}
            </p>
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