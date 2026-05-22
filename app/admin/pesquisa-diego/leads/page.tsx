"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import {
  buildLeadWhatsappMessage,
  getNextActionByStatus,
  getPlaybookByAudience,
  getStatusIndex,
  leadStatuses,
  statusFlow,
} from "@/lib/journey-playbook";

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
  const [showHelp, setShowHelp] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [audienceFilter, setAudienceFilter] = useState("todos");

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

  const audiences = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.audience_slug).filter(Boolean))).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "todos" || lead.lead_status === statusFilter;
      const matchesAudience = audienceFilter === "todos" || lead.audience_slug === audienceFilter;
      return matchesStatus && matchesAudience;
    });
  }, [audienceFilter, leads, statusFilter]);

  async function copyMessage(lead: Lead) {
    const text = buildLeadWhatsappMessage({
      name: lead.name,
      detectedProfile: lead.detected_profile,
      audienceSlug: lead.audience_slug,
      status: lead.lead_status,
    });

    setMessages((current) => ({ ...current, [lead.id]: text }));

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  function whatsappLink(lead: Lead) {
    const text =
      messages[lead.id] ??
      buildLeadWhatsappMessage({
        name: lead.name,
        detectedProfile: lead.detected_profile,
        audienceSlug: lead.audience_slug,
        status: lead.lead_status,
      });

    const phone = lead.whatsapp.replace(/\D/g, "");
    const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label-pill">CRM da Jornada</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Leads e mensagens para WhatsApp
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Conduza cada pessoa pela Jornada Personal Extrema: dor entendida,
            oferta gratuita certa, conversa de diagnóstico e proposta sem cair
            no mar vermelho do treino genérico.
          </p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <button
            className="btn-admin-secondary"
            type="button"
            onClick={() => setShowHelp(true)}
          >
            Como abordar leads?
          </button>
          <Link
            className="btn-admin-secondary"
            href={`/admin/pesquisa-diego?token=${encodeURIComponent(token)}`}
          >
            Voltar ao painel
          </Link>
        </div>
      </div>

      {showHelp ? <LeadsHelpModal onClose={() => setShowHelp(false)} /> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="card p-5">
          <p className="label-pill">Fluxograma</p>
          <h2 className="mt-3 text-2xl font-black">Funil consultivo recomendado</h2>
          <div className="journey-flow mt-4">
            {statusFlow.map((status, index) => (
              <div key={status} className="journey-step">
                <span className="journey-step-number">{index + 1}</span>
                <span>{status}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            A venda aparece como consequência do diagnóstico. Primeiro vem
            acolhimento, oferta gratuita e entendimento da rotina.
          </p>
        </div>

        <div className="card p-5">
          <p className="label-pill">Prioridade</p>
          <h2 className="mt-3 text-2xl font-black">O que olhar primeiro</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li><strong>1.</strong> Leads com interesse alto.</li>
            <li><strong>2.</strong> Comentários com dor, medo ou urgência.</li>
            <li><strong>3.</strong> Pessoas que aceitaram diagnóstico/piloto.</li>
            <li><strong>4.</strong> Parceiros com possibilidade de B2B.</li>
          </ul>
        </div>
      </div>

      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-bold">
          Filtrar status
          <select
            className="select mt-2"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="todos">Todos</option>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold">
          Filtrar público
          <select
            className="select mt-2"
            value={audienceFilter}
            onChange={(event) => setAudienceFilter(event.target.value)}
          >
            <option value="todos">Todos</option>
            {audiences.map((audience) => (
              <option key={audience} value={audience}>
                {audience}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-sm font-bold text-slate-500">Total exibido</p>
          <p className="mt-1 text-3xl font-black">{filteredLeads.length}</p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">
          <p className="text-sm font-bold">Lembrete</p>
          <p className="mt-1 text-sm leading-5">
            Novo lead deve receber mensagem em até 24h.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-slate-600">Carregando leads...</p>
      ) : null}

      {!isLoading && filteredLeads.length === 0 ? (
        <p className="mt-8 text-slate-600">Nenhum lead encontrado com os filtros atuais.</p>
      ) : null}

      <div className="mt-8 grid gap-4">
        {filteredLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            message={messages[lead.id]}
            onCopy={() => copyMessage(lead)}
            onStatusChange={(status) => updateStatus(lead.id, status)}
            whatsappHref={whatsappLink(lead)}
          />
        ))}
      </div>
    </section>
  );
}

function LeadCard({
  lead,
  message,
  onCopy,
  onStatusChange,
  whatsappHref,
}: {
  lead: Lead;
  message?: string;
  onCopy: () => void;
  onStatusChange: (status: string) => void;
  whatsappHref: string;
}) {
  const playbook = getPlaybookByAudience(lead.audience_slug);
  const currentIndex = getStatusIndex(lead.lead_status);
  const nextAction = getNextActionByStatus(lead.lead_status, lead.audience_slug);
  const createdAt = new Date(lead.created_at).toLocaleDateString("pt-BR");

  return (
    <article className="card overflow-hidden p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="label-pill">{playbook.label}</p>
              <h2 className="mt-3 text-2xl font-black">{lead.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {lead.whatsapp} • recebido em {createdAt}
              </p>
              <p className="mt-3 text-sm">
                <strong>Perfil detectado:</strong> {lead.detected_profile}
              </p>
              <p className="text-sm">
                <strong>Interesse:</strong> {lead.interest_level} •{" "}
                <strong>Status:</strong> {lead.lead_status}
              </p>
            </div>

            <div className="grid gap-2 sm:min-w-56">
              <button className="btn-admin-secondary" type="button" onClick={onCopy}>
                Copiar mensagem
              </button>
              <a className="btn-admin-primary text-center" href={whatsappHref} target="_blank" rel="noreferrer">
                Abrir WhatsApp
              </a>
            </div>
          </div>

          <div className="journey-flow mt-5">
            {statusFlow.map((status, index) => (
              <div
                key={status}
                className={`journey-step ${
                  index <= currentIndex ? "journey-step-active" : ""
                }`}
              >
                <span className="journey-step-number">{index + 1}</span>
                <span>{status}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-950">
            <p className="text-sm font-black">Próxima ação recomendada</p>
            <p className="mt-2 text-sm leading-6">{nextAction}</p>
          </div>

          {message ? (
            <textarea
              className="textarea mt-4 min-h-36"
              readOnly
              value={message}
            />
          ) : null}
        </div>

        <aside className="rounded-[24px] bg-slate-100 p-4">
          <h3 className="text-lg font-black">Playbook deste lead</h3>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p><strong>Posicionamento:</strong> {playbook.positioning}</p>
            <p><strong>Oferta gratuita:</strong> {playbook.freeOffer}</p>
            <p><strong>Programa natural:</strong> {playbook.nextProgram}</p>
            <p><strong>Cuidado:</strong> {playbook.caution}</p>
          </div>

          <details className="mt-4 rounded-2xl bg-white p-3">
            <summary className="cursor-pointer font-black">Perguntas Deep Dive</summary>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {playbook.discoveryQuestions.map((question) => (
                <li key={question}>• {question}</li>
              ))}
            </ul>
          </details>

          <label className="mt-4 block text-sm font-bold">
            Atualizar status
            <select
              className="select mt-2"
              value={lead.lead_status}
              onChange={(event) => onStatusChange(event.target.value)}
            >
              {leadStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </aside>
      </div>
    </article>
  );
}

function LeadsHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-3 backdrop-blur sm:items-center sm:justify-center">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-5 text-slate-950 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-pill">Ajuda da Jornada</p>
            <h2 className="mt-3 text-2xl font-black">
              Como conduzir cada lead
            </h2>
          </div>
          <button className="btn-admin-secondary" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">1. Não comece pelo preço</h3>
            <p className="mt-2">
              Comece mostrando que entendeu a dor da pessoa. Depois ofereça
              o material gratuito e só então convide para diagnóstico.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">2. Use o botão “Copiar mensagem”</h3>
            <p className="mt-2">
              A mensagem já segue uma lógica de Deep Dive: reconhece o perfil,
              posiciona o Diego Montagnini e oferece um próximo passo leve.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">3. Abra o WhatsApp pelo celular</h3>
            <p className="mt-2">
              A tela foi organizada em cards para facilitar o uso mobile:
              copiar mensagem, abrir WhatsApp e mudar status no mesmo bloco.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">4. Atualize status sempre</h3>
            <p className="mt-2">
              O status é o histórico comercial da Jornada Personal Extrema.
              Sem status atualizado, o Diego perde visão do funil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">CRM da Jornada</p>
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
