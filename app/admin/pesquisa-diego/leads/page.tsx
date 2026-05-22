"use client";

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
  recentResponses: Lead[];
};

function LeadsContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
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
              : "Erro ao carregar leads.",
          );
        }

        if (isMounted) {
          setLeads((data as Summary).recentResponses ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar leads.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function loadMessage(id: string) {
    const lead = leads.find((item) => item.id === id);

    const text = `Oi, ${
      lead?.name?.split(" ")[0] ?? "tudo bem"
    }. Aqui é o Diego Montagnini. Vi suas respostas no diagnóstico da Jornada Personal Extrema e percebi que seu perfil está relacionado a: ${
      lead?.detected_profile ?? "sua rotina e seus objetivos"
    }. Posso te enviar uma devolutiva inicial gratuita e um próximo passo simples para sua rotina?`;

    setMessages((current) => ({ ...current, [id]: text }));

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch(
      `/api/admin/leads/status?token=${encodeURIComponent(token)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      },
    );

    if (response.ok) {
      setLeads((current) =>
        current.map((lead) =>
          lead.id === id ? { ...lead, lead_status: status } : lead,
        ),
      );
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">CRM simples</p>

      <h1 className="mt-3 text-4xl font-black text-slate-950">
        Leads e mensagens para WhatsApp
      </h1>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-slate-600">Carregando leads...</p>
      ) : null}

      {!isLoading && leads.length === 0 ? (
        <p className="mt-8 text-slate-600">Nenhum lead encontrado ainda.</p>
      ) : null}

      <div className="mt-8 grid gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{lead.name}</h2>

                <p className="text-sm text-slate-600">
                  {lead.whatsapp} • {lead.audience_slug}
                </p>

                <p className="mt-2 text-sm">
                  <strong>Perfil:</strong> {lead.detected_profile}
                </p>

                <p className="text-sm">
                  <strong>Interesse:</strong> {lead.interest_level} •{" "}
                  <strong>Status:</strong> {lead.lead_status}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => loadMessage(lead.id)}
                >
                  Copiar mensagem
                </button>

                <select
                  className="select max-w-56"
                  value={lead.lead_status}
                  onChange={(event) => updateStatus(lead.id, event.target.value)}
                >
                  <option>Novo</option>
                  <option>Mensagem enviada</option>
                  <option>Diagnóstico agendado</option>
                  <option>Piloto oferecido</option>
                  <option>Virou aluno</option>
                  <option>Sem interesse agora</option>
                  <option>Parceiro potencial</option>
                  <option>Arquivado</option>
                </select>
              </div>
            </div>

            {messages[lead.id] ? (
              <textarea
                className="textarea mt-4 min-h-28"
                readOnly
                value={messages[lead.id]}
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function LeadsFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">CRM simples</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">
        Leads e mensagens para WhatsApp
      </h1>
      <p className="mt-8 text-slate-600">Carregando leads...</p>
    </section>
  );
}

export default function LeadsPage() {
  return (
    <main className="admin-shell">
      <Header />
      <Suspense fallback={<LeadsFallback />}>
        <LeadsContent />
      </Suspense>
    </main>
  );
}