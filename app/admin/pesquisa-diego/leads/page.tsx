"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildFollowupSuggestion, isFollowupOverdue, isWithoutRecentMessage } from "@/lib/automation-rules";
import { getConversionLabel } from "@/lib/funnel";
import {
  buildLeadWhatsappMessage,
  getNextActionByStatus,
  getPlaybookByAudience,
  getStatusIndex,
  leadStatuses,
  statusFlow,
} from "@/lib/journey-playbook";
import { Header } from "@/components/Header";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { adminFetch, buildAdminApiUrl } from "@/lib/client-admin";
import type { LeadCrmFields, LeadSummary } from "@/lib/types";

type Lead = LeadSummary;

type Summary = {
  recentResponses: Lead[];
};

type LeadPatch = LeadCrmFields & {
  lead_status?: string;
  markMessageSentNow?: boolean;
  generateFollowup?: boolean;
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

const automationFilters = [
  { value: "todos", label: "Todos" },
  { value: "vencidos", label: "Follow-up vencido" },
  { value: "sem-mensagem", label: "Sem mensagem 7+ dias" },
  { value: "quentes", label: "Prioridade alta" },
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

function fromDateTimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function LeadsContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, LeadCrmFields>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [audienceFilter, setAudienceFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todos");
  const [automationFilter, setAutomationFilter] = useState("todos");

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await adminFetch("/api/admin/summary", token);

        const data = (await response.json()) as Summary | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Erro ao carregar leads.",
          );
        }

        if (isMounted) {
          const loadedLeads = (data as Summary).recentResponses ?? [];
          setLeads(loadedLeads);
          setDrafts(
            Object.fromEntries(
              loadedLeads.map((lead) => [
                lead.id,
                {
                  priority: lead.priority ?? "media",
                  next_contact_at: lead.next_contact_at ?? null,
                  internal_notes: lead.internal_notes ?? "",
                  delivered_offer: lead.delivered_offer ?? "",
                  last_message_at: lead.last_message_at ?? null,
                  converted_at: lead.converted_at ?? null,
                  conversion_status: lead.conversion_status ?? null,
                  program_suggested: lead.program_suggested ?? "",
                  followup_count: lead.followup_count ?? 0,
                  last_followup_suggestion: lead.last_followup_suggestion ?? "",
                  weekly_report_bucket: lead.weekly_report_bucket ?? "",
                  lost_reason: lead.lost_reason ?? "",
                  narrated_context: lead.narrated_context ?? "",
                  known_history_summary: lead.known_history_summary ?? "",
                  next_journey_step: lead.next_journey_step ?? "",
                },
              ]),
            ),
          );
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
      const matchesAutomation =
        automationFilter === "todos" ||
        (automationFilter === "vencidos" && isFollowupOverdue(lead)) ||
        (automationFilter === "sem-mensagem" && isWithoutRecentMessage(lead, 7)) ||
        (automationFilter === "quentes" && (lead.priority ?? "media") === "alta");

      return matchesStatus && matchesAudience && matchesPriority && matchesAutomation;
    });
  }, [audienceFilter, automationFilter, leads, priorityFilter, statusFilter]);

  const metrics = useMemo(() => {
    return {
      total: leads.length,
      overdue: leads.filter(isFollowupOverdue).length,
      noMessage: leads.filter((lead) => isWithoutRecentMessage(lead, 7)).length,
      highPriority: leads.filter((lead) => (lead.priority ?? "media") === "alta").length,
    };
  }, [leads]);

  function updateDraft(id: string, patch: LeadCrmFields) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  }

  async function patchLead(id: string, patch: LeadPatch) {
    setSavingIds((current) => ({ ...current, [id]: true }));

    try {
      const response = await adminFetch(
        "/api/admin/leads/status",
        token,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: patch.lead_status,
            priority: patch.priority,
            internalNotes: patch.internal_notes,
            deliveredOffer: patch.delivered_offer,
            nextContactAt: patch.next_contact_at,
            lastMessageAt: patch.last_message_at,
            convertedAt: patch.converted_at,
            conversionStatus: patch.conversion_status,
            programSuggested: patch.program_suggested,
            followupCount: patch.followup_count,
            lastFollowupSuggestion: patch.last_followup_suggestion,
            weeklyReportBucket: patch.weekly_report_bucket,
            lostReason: patch.lost_reason,
            narratedContext: patch.narrated_context,
            knownHistorySummary: patch.known_history_summary,
            nextJourneyStep: patch.next_journey_step,
            markMessageSentNow: patch.markMessageSentNow,
            generateFollowup: patch.generateFollowup,
          }),
        },
      );

      const data = (await response.json()) as { lead?: Lead; error?: string };

      if (!response.ok || !data.lead) {
        throw new Error(data.error ?? "Não foi possível atualizar o lead.");
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === id ? data.lead as Lead : lead)),
      );

      const lead = data.lead;

      setDrafts((current) => ({
        ...current,
        [id]: {
          priority: lead.priority ?? "media",
          next_contact_at: lead.next_contact_at ?? null,
          internal_notes: lead.internal_notes ?? "",
          delivered_offer: lead.delivered_offer ?? "",
          last_message_at: lead.last_message_at ?? null,
          converted_at: lead.converted_at ?? null,
          conversion_status: lead.conversion_status ?? null,
          program_suggested: lead.program_suggested ?? "",
          followup_count: lead.followup_count ?? 0,
          last_followup_suggestion: lead.last_followup_suggestion ?? "",
          weekly_report_bucket: lead.weekly_report_bucket ?? "",
          lost_reason: lead.lost_reason ?? "",
          narrated_context: lead.narrated_context ?? "",
          known_history_summary: lead.known_history_summary ?? "",
          next_journey_step: lead.next_journey_step ?? "",
        },
      }));

      if (patch.generateFollowup && lead.last_followup_suggestion) {
        setMessages((current) => ({ ...current, [id]: lead.last_followup_suggestion ?? "" }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar lead.");
    } finally {
      setSavingIds((current) => ({ ...current, [id]: false }));
    }
  }

  async function copyText(id: string, text: string) {
    setMessages((current) => ({ ...current, [id]: text }));

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  async function copyInitialMessage(lead: Lead) {
    const text = buildLeadWhatsappMessage({
      name: lead.name,
      audienceSlug: lead.audience_slug,
      detectedProfile: lead.detected_profile,
    });

    await copyText(lead.id, text);
  }

  async function copySuggestedFollowup(lead: Lead) {
    const savedText = lead.last_followup_suggestion || drafts[lead.id]?.last_followup_suggestion;
    const text = savedText || buildFollowupSuggestion(lead).whatsappText;
    await copyText(lead.id, text);
  }

  async function generateFollowup(lead: Lead) {
    await patchLead(lead.id, { generateFollowup: true });
  }

  async function markMessageSent(lead: Lead) {
    const count = (lead.followup_count ?? 0) + 1;
    await patchLead(lead.id, {
      lead_status: lead.lead_status === "Novo" ? "Mensagem enviada" : lead.lead_status,
      markMessageSentNow: true,
      last_message_at: new Date().toISOString(),
      followup_count: count,
    });
  }
  async function copyAudioPrompt(lead: Lead) {
    const prompt = buildAudioPrompt(lead);
    await copyText(lead.id, prompt);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">CRM da Jornada</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Leads, follow-ups e mensagens para WhatsApp
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Acompanhe cada lead como uma jornada: diagnóstico, mensagem, oferta
            gratuita, follow-up, conversa, piloto e conversão.
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
            href={buildAdminApiUrl("/admin/pesquisa-diego", token)}
          >
            Painel
          </Link>

          <Link
            className="btn-admin-primary"
            href={buildAdminApiUrl("/admin/pesquisa-diego/dashboard", token)}
          >
            Dashboard semanal
          </Link>
        </div>
      </div>

      {showHelp ? <LeadsHelpModal onClose={() => setShowHelp(false)} /> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Leads" value={metrics.total} />
        <MetricCard label="Follow-ups vencidos" value={metrics.overdue} highlight />
        <MetricCard label="Sem mensagem 7+ dias" value={metrics.noMessage} />
        <MetricCard label="Prioridade alta" value={metrics.highPriority} />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block text-sm font-bold">
            Status
            <select className="select mt-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {leadStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Público
            <select className="select mt-2" value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {audiences.map((audience) => <option key={audience}>{audience}</option>)}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Prioridade
            <select className="select mt-2" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option value="todos">Todas</option>
              {priorityOptions.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Automação assistida
            <select className="select mt-2" value={automationFilter} onChange={(event) => setAutomationFilter(event.target.value)}>
              {automationFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? <p className="mt-8 text-slate-600">Carregando leads...</p> : null}

      {!isLoading && filteredLeads.length === 0 ? (
        <p className="mt-8 text-slate-600">Nenhum lead encontrado para os filtros selecionados.</p>
      ) : null}

      <div className="mt-8 grid gap-5">
        {filteredLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            draft={drafts[lead.id] ?? {}}
            message={messages[lead.id]}
            isSaving={Boolean(savingIds[lead.id])}
            onDraftChange={(patch) => updateDraft(lead.id, patch)}
            onSaveCrm={() => patchLead(lead.id, drafts[lead.id] ?? {})}
            onStatusChange={(status) => patchLead(lead.id, { lead_status: status })}
            onCopyInitial={() => copyInitialMessage(lead)}
            onGenerateFollowup={() => generateFollowup(lead)}
            onCopyFollowup={() => copySuggestedFollowup(lead)}
            onMarkMessageSent={() => markMessageSent(lead)}
            onCopyAudioPrompt={() => copyAudioPrompt(lead)}
          />
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`card p-5 ${highlight ? "border-amber-300 bg-amber-50" : ""}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function LeadCard({
  lead,
  draft,
  message,
  isSaving,
  onDraftChange,
  onSaveCrm,
  onStatusChange,
  onCopyInitial,
  onGenerateFollowup,
  onCopyFollowup,
  onMarkMessageSent,
  onCopyAudioPrompt,
}: {
  lead: Lead;
  draft: LeadCrmFields;
  message?: string;
  isSaving: boolean;
  onDraftChange: (patch: LeadCrmFields) => void;
  onSaveCrm: () => void;
  onStatusChange: (status: string) => void;
  onCopyInitial: () => void;
  onGenerateFollowup: () => void;
  onCopyFollowup: () => void;
  onMarkMessageSent: () => void;
  onCopyAudioPrompt: () => void;
}) {
  const playbook = getPlaybookByAudience(lead.audience_slug);
  const nextAction = getNextActionByStatus(lead.lead_status, lead.audience_slug);
  const suggestion = buildFollowupSuggestion(lead);
  const whatsapp = normalizeWhatsapp(lead.whatsapp);
  const statusIndex = getStatusIndex(lead.lead_status);

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-pill">{lead.audience_slug}</span>
            <span className="label-pill">Prioridade {(lead.priority ?? "media").toString()}</span>
            {isFollowupOverdue(lead) ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">Follow-up vencido</span> : null}
            {isWithoutRecentMessage(lead, 7) ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Sem mensagem 7+ dias</span> : null}
          </div>

          <h2 className="mt-3 text-2xl font-black">{lead.name}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {lead.whatsapp} • {lead.detected_profile}
          </p>
          <p className="mt-2 text-sm">
            <strong>Status:</strong> {lead.lead_status} •{" "}
            <strong>Conversão:</strong> {getConversionLabel(lead.conversion_status)} •{" "}
            <strong>Interesse:</strong> {lead.interest_level}
          </p>
          <p className="mt-2 text-sm">
            <strong>Última mensagem:</strong> {formatDateTime(lead.last_message_at)} •{" "}
            <strong>Próximo contato:</strong> {formatDateTime(lead.next_contact_at)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[360px]">
          <button className="btn-admin-secondary" type="button" onClick={onCopyInitial}>
            Copiar mensagem inicial
          </button>
          <button className="btn-admin-secondary" type="button" onClick={onGenerateFollowup}>
            Gerar follow-up
          </button>
          <button className="btn-admin-secondary" type="button" onClick={onCopyFollowup}>
            Copiar follow-up
          </button>
          <button className="btn-admin-secondary" type="button" onClick={onMarkMessageSent}>
            Marcar mensagem hoje
          </button>
          <button className="btn-admin-secondary" type="button" onClick={onCopyAudioPrompt}>
            Prompt para áudio
          </button>
          {whatsapp ? (
            <a
              className="btn-admin-primary sm:col-span-2"
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message || lead.last_followup_suggestion || buildLeadWhatsappMessage({ name: lead.name, audienceSlug: lead.audience_slug, detectedProfile: lead.detected_profile }))}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-black text-slate-600">Fluxo da jornada</p>
        <div className="journey-flow mt-3">
          {statusFlow.map((status, index) => (
            <span
              key={status}
              className={`journey-step ${index <= statusIndex ? "journey-step-active" : ""}`}
            >
              <span className="journey-step-number">{index + 1}</span>
              {status}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-100 p-4">
          <h3 className="font-black">Próxima ação recomendada</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{nextAction}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            <strong>Follow-up sugerido:</strong> {suggestion.title}. {suggestion.action}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            <strong>Programa natural:</strong> {draft.program_suggested || playbook.nextProgram}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <h3 className="font-black text-emerald-950">Playbook Oceano Azul</h3>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            {playbook.oceanBlueAngle}
          </p>
          <p className="mt-3 text-sm leading-6 text-emerald-900">
            <strong>Oferta gratuita:</strong> {playbook.freeOffer}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="block text-sm font-bold">
          Status
          <select className="select mt-2" value={lead.lead_status} onChange={(event) => onStatusChange(event.target.value)}>
            {leadStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>

        <label className="block text-sm font-bold">
          Prioridade
          <select className="select mt-2" value={(draft.priority ?? "media") as string} onChange={(event) => onDraftChange({ priority: event.target.value })}>
            {priorityOptions.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
          </select>
        </label>

        <label className="block text-sm font-bold">
          Oferta entregue
          <select className="select mt-2" value={draft.delivered_offer ?? ""} onChange={(event) => onDraftChange({ delivered_offer: event.target.value })}>
            {deliveredOfferOptions.map((offer) => <option key={offer} value={offer}>{offer || "Nenhuma"}</option>)}
          </select>
        </label>

        <label className="block text-sm font-bold">
          Próximo contato
          <input className="input mt-2" type="datetime-local" value={toDateTimeLocal(draft.next_contact_at)} onChange={(event) => onDraftChange({ next_contact_at: fromDateTimeLocal(event.target.value) })} />
        </label>

        <label className="block text-sm font-bold">
          Última mensagem
          <input className="input mt-2" type="datetime-local" value={toDateTimeLocal(draft.last_message_at)} onChange={(event) => onDraftChange({ last_message_at: fromDateTimeLocal(event.target.value) })} />
        </label>

        <label className="block text-sm font-bold">
          Programa sugerido
          <input className="input mt-2" value={draft.program_suggested ?? ""} onChange={(event) => onDraftChange({ program_suggested: event.target.value })} placeholder={playbook.nextProgram} />
        </label>

        <label className="block text-sm font-bold">
          Data da conversão
          <input className="input mt-2" type="datetime-local" value={toDateTimeLocal(draft.converted_at)} onChange={(event) => onDraftChange({ converted_at: fromDateTimeLocal(event.target.value) })} />
        </label>

        <label className="block text-sm font-bold">
          Motivo de perda
          <input className="input mt-2" value={draft.lost_reason ?? ""} onChange={(event) => onDraftChange({ lost_reason: event.target.value })} placeholder="Ex.: sem orçamento, sem tempo, sem resposta" />
        </label>

        <label className="block text-sm font-bold">
          Bucket semanal
          <input className="input mt-2" value={draft.weekly_report_bucket ?? ""} onChange={(event) => onDraftChange({ weekly_report_bucket: event.target.value })} placeholder="Ex.: Follow-up vencido" />
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold">
        Observações internas
        <textarea
          className="textarea mt-2 min-h-24"
          value={draft.internal_notes ?? ""}
          onChange={(event) => onDraftChange({ internal_notes: event.target.value })}
          placeholder="Registre dores, objeções, disponibilidade, resposta ao WhatsApp e contexto humano."
        />
      </label>

      <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-emerald-950">Memória narrada do Diego</h3>
            <p className="mt-1 text-sm leading-6 text-emerald-900">
              Use este bloco para registrar o que Diego já sabe sobre alunos atuais. A proposta é não perguntar tudo de novo: o histórico conhecido deve orientar a próxima etapa da Jornada.
            </p>
          </div>
          <button className="btn-admin-secondary" type="button" onClick={onCopyAudioPrompt}>
            Copiar prompt
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-bold text-emerald-950 lg:col-span-3">
            Registro narrado/transcrito pelo Diego
            <textarea
              className="textarea mt-2 min-h-28"
              value={draft.narrated_context ?? ""}
              onChange={(event) => onDraftChange({ narrated_context: event.target.value })}
              placeholder="Cole aqui a transcrição ou o resumo do áudio do Diego sobre o aluno: histórico, evolução, limitações, hábitos, preferências, contexto familiar/profissional e pontos de atenção."
            />
          </label>

          <label className="block text-sm font-bold text-emerald-950 lg:col-span-2">
            Síntese do histórico conhecido
            <textarea
              className="textarea mt-2 min-h-24"
              value={draft.known_history_summary ?? ""}
              onChange={(event) => onDraftChange({ known_history_summary: event.target.value })}
              placeholder="Ex.: aluno treina há 2 anos, evoluiu em força, tem dificuldade de constância em semanas de trabalho intenso, prefere treino objetivo e precisa de mobilidade."
            />
          </label>

          <label className="block text-sm font-bold text-emerald-950">
            Próxima etapa sugerida da Jornada
            <textarea
              className="textarea mt-2 min-h-24"
              value={draft.next_journey_step ?? ""}
              onChange={(event) => onDraftChange({ next_journey_step: event.target.value })}
              placeholder="Ex.: reavaliação, ajuste de programa, relatório de evolução, conversa sobre novo objetivo, convite para piloto."
            />
          </label>
        </div>
      </div>

      <button className="btn-admin-primary mt-4" type="button" onClick={onSaveCrm} disabled={isSaving}>
        {isSaving ? "Salvando..." : "Salvar acompanhamento"}
      </button>

      {message ? (
        <textarea className="textarea mt-4 min-h-32" readOnly value={message} />
      ) : null}
    </div>
  );
}

function buildAudioPrompt(lead: Lead) {
  return `Você é um assistente de organização da Jornada Personal Extrema do Diego Montagnini.

Vou colar abaixo a transcrição de um áudio gravado pelo Diego sobre ${lead.name}.

Objetivo: transformar a fala em um cadastro útil, sem inventar informações e sem criar diagnóstico médico.

Contexto atual do lead/aluno:
- Nome: ${lead.name}
- Público: ${lead.audience_slug}
- Perfil detectado: ${lead.detected_profile}
- Status atual: ${lead.lead_status}
- Programa sugerido até agora: ${lead.program_suggested ?? "não informado"}

Ao receber a transcrição, devolva em 5 blocos:
1. Resumo do histórico conhecido pelo Diego.
2. Informações importantes para não perguntar novamente ao aluno.
3. Dores, desejos, limitações, preferências e contexto de rotina.
4. Próxima etapa recomendada da Jornada Personal Extrema.
5. Pontos que o Diego deve confirmar com cuidado, sem parecer que esqueceu o histórico do aluno.

Cuidados:
- Não invente dados.
- Não faça diagnóstico médico.
- Separe fato, hipótese e ponto a confirmar.
- Use linguagem prática para colar no sistema.

Transcrição do áudio:
[COLE AQUI A TRANSCRIÇÃO]`;
}

function LeadsHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4">
      <div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-pill">Automação assistida</p>
            <h2 className="mt-3 text-3xl font-black">Como abordar leads sem cair no mar vermelho</h2>
          </div>
          <button className="btn-admin-secondary" type="button" onClick={onClose}>Fechar</button>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">1. Priorize quem está vencido ou quente</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Comece por follow-ups vencidos, prioridade alta e leads sem mensagem há mais de 7 dias.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">2. Use follow-up como continuação da dor</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A mensagem não deve vender treino. Deve retomar a dor, entregar valor gratuito e chamar para diagnóstico.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <h3 className="font-black">3. Atualize o funil sempre</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cada contato precisa atualizar status, última mensagem e próximo contato para alimentar o dashboard semanal.
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
        <AdminAuthGuard>
          <LeadsContent />
        </AdminAuthGuard>
      </Suspense>
    </main>
  );
}
