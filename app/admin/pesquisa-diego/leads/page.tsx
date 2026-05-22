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
import type { LeadCrmFields, LeadSummary } from "@/lib/types";

type Lead = LeadSummary;

type Summary = {
  recentResponses: Lead[];
};

type LeadPatch = LeadCrmFields & {
  lead_status?: string;
};

const priorityOptions = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

const deliveredOfferOptions = [
  "",
  "Checklist Corredor Forte",
  "Miniavaliação Força e Autonomia 45+",
  "Plano com 3 treinos de 20 minutos",
  "Áudio/PDF de respiração e presença antes do treino",
  "Diagnóstico gratuito de retenção e acompanhamento de alunos",
  "Relatório gratuito de evolução mensal",
  "Reavaliação gratuita de retorno",
  "Outro",
];

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value?: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

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
  const [priorityFilter, setPriorityFilter] = useState("todos");

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
      const matchesPriority = priorityFilter === "todos" || (lead.priority ?? "media") === priorityFilter;
      return matchesStatus && matchesAudience && matchesPriority;
    });
  }, [audienceFilter, leads, priorityFilter, statusFilter]);

  async function updateLead(id: string, updates: LeadPatch) {
    const response = await fetch(
      `/api/admin/leads/status?token=${encodeURIComponent(token)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: updates.lead_status,
          priority: updates.priority,
          internalNotes: updates.internal_notes,
          deliveredOffer: updates.delivered_offer,
          nextContactAt: updates.next_contact_at,
          lastMessageAt: updates.last_message_at,
        }),
      },
    );

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      lead?: Lead;
    };

    if (!response.ok) {
      throw new Error(data.error ?? "Não foi possível atualizar o lead.");
    }

    setLeads((current) =>
      current.map((lead) =>
        lead.id === id ? { ...lead, ...(data.lead ?? updates) } : lead,
      ),
    );
  }

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

    await updateLead(lead.id, { last_message_at: new Date().toISOString() });
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

  const overdueCount = leads.filter((lead) => isOverdue(lead.next_contact_at)).length;

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
            oferta gratuita certa, próximo contato registrado e proposta sem cair
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
            acolhimento, oferta gratuita, registro de follow-up e entendimento da rotina.
          </p>
        </div>

        <div className="card p-5">
          <p className="label-pill">Prioridade</p>
          <h2 className="mt-3 text-2xl font-black">O que olhar primeiro</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li><strong>1.</strong> Próximos contatos vencidos: {overdueCount}.</li>
            <li><strong>2.</strong> Leads com prioridade alta.</li>
            <li><strong>3.</strong> Leads com interesse alto e comentário aberto.</li>
            <li><strong>4.</strong> Pessoas que receberam oferta, mas não avançaram.</li>
          </ul>
        </div>
      </div>

      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <label className="text-sm font-bold">
          Filtrar prioridade
          <select
            className="select mt-2"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="todos">Todas</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            Use próximo contato para não perder o timing da jornada.
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
            onSave={(updates) => updateLead(lead.id, updates)}
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
  onSave,
  whatsappHref,
}: {
  lead: Lead;
  message?: string;
  onCopy: () => Promise<void>;
  onSave: (updates: LeadPatch) => Promise<void>;
  whatsappHref: string;
}) {
  const playbook = getPlaybookByAudience(lead.audience_slug);
  const currentIndex = getStatusIndex(lead.lead_status);
  const nextAction = getNextActionByStatus(lead.lead_status, lead.audience_slug);
  const createdAt = new Date(lead.created_at).toLocaleDateString("pt-BR");
  const [status, setStatus] = useState(lead.lead_status);
  const [priority, setPriority] = useState(lead.priority ?? "media");
  const [nextContactAt, setNextContactAt] = useState(toDateTimeLocal(lead.next_contact_at));
  const [deliveredOffer, setDeliveredOffer] = useState(lead.delivered_offer ?? "");
  const [lastMessageAt, setLastMessageAt] = useState(toDateTimeLocal(lead.last_message_at));
  const [internalNotes, setInternalNotes] = useState(lead.internal_notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const overdue = isOverdue(lead.next_contact_at);

  useEffect(() => {
    setStatus(lead.lead_status);
    setPriority(lead.priority ?? "media");
    setNextContactAt(toDateTimeLocal(lead.next_contact_at));
    setDeliveredOffer(lead.delivered_offer ?? "");
    setLastMessageAt(toDateTimeLocal(lead.last_message_at));
    setInternalNotes(lead.internal_notes ?? "");
  }, [lead]);

  async function saveCrm() {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      await onSave({
        lead_status: status,
        priority,
        next_contact_at: nextContactAt,
        delivered_offer: deliveredOffer,
        last_message_at: lastMessageAt,
        internal_notes: internalNotes,
      });
      setSaveMessage("Acompanhamento salvo.");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Erro ao salvar acompanhamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopy() {
    await onCopy();
    setLastMessageAt(toDateTimeLocal(new Date().toISOString()));
    setSaveMessage("Mensagem copiada e data da última mensagem registrada.");
  }

  return (
    <article className="card overflow-hidden p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <p className="label-pill">{playbook.label}</p>
                <p className={`label-pill ${priority === "alta" ? "bg-red-100 text-red-800" : ""}`}>
                  Prioridade {priority}
                </p>
                {overdue ? <p className="label-pill bg-amber-100 text-amber-900">Contato vencido</p> : null}
              </div>
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
              <p className="mt-2 text-sm text-slate-600">
                <strong>Última mensagem:</strong> {formatDateTime(lead.last_message_at)} •{" "}
                <strong>Próximo contato:</strong> {formatDateTime(lead.next_contact_at)}
              </p>
            </div>

            <div className="grid gap-2 sm:min-w-56">
              <button className="btn-admin-secondary" type="button" onClick={handleCopy}>
                Copiar mensagem
              </button>
              <a className="btn-admin-primary text-center" href={whatsappHref} target="_blank" rel="noreferrer">
                Abrir WhatsApp
              </a>
            </div>
          </div>

          <div className="journey-flow mt-5">
            {statusFlow.map((flowStatus, index) => (
              <div
                key={flowStatus}
                className={`journey-step ${
                  index <= currentIndex ? "journey-step-active" : ""
                }`}
              >
                <span className="journey-step-number">{index + 1}</span>
                <span>{flowStatus}</span>
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
          <h3 className="text-lg font-black">Acompanhamento CRM</h3>

          <div className="mt-4 grid gap-3">
            <label className="text-sm font-bold">
              Status
              <select
                className="select mt-2"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {leadStatuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Prioridade
              <select
                className="select mt-2"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Próximo contato
              <input
                className="input mt-2"
                type="datetime-local"
                value={nextContactAt}
                onChange={(event) => setNextContactAt(event.target.value)}
              />
            </label>

            <label className="text-sm font-bold">
              Data da última mensagem
              <input
                className="input mt-2"
                type="datetime-local"
                value={lastMessageAt}
                onChange={(event) => setLastMessageAt(event.target.value)}
              />
            </label>

            <label className="text-sm font-bold">
              Oferta entregue
              <select
                className="select mt-2"
                value={deliveredOffer}
                onChange={(event) => setDeliveredOffer(event.target.value)}
              >
                {deliveredOfferOptions.map((offer) => (
                  <option key={offer} value={offer}>
                    {offer || "Nenhuma"}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Observações internas
              <textarea
                className="textarea mt-2 min-h-28"
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                placeholder="Ex.: respondeu que só consegue treinar à noite; quer começar em casa; chamar novamente em 15 dias."
              />
            </label>

            <button className="btn-admin-primary" type="button" onClick={saveCrm} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar acompanhamento"}
            </button>

            {saveMessage ? (
              <p className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                {saveMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
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
          </div>
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
            <h3 className="font-black">2. Registre o próximo contato</h3>
            <p className="mt-2">
              Use o campo “Próximo contato” para transformar intenção em rotina.
              Isso evita leads esquecidos e mantém a jornada viva.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">3. Use prioridade e oferta entregue</h3>
            <p className="mt-2">
              Prioridade ajuda o Diego a focar nos leads com mais urgência. Oferta entregue
              mostra se a pessoa já recebeu valor antes da proposta paga.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">4. Anote contexto humano</h3>
            <p className="mt-2">
              Observações como rotina, dores, medo, preferência de horário e objeções
              ajudam a próxima conversa ser personalizada e não genérica.
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
