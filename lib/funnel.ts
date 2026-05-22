import type { ConversionStatus, FunnelStage, LeadSummary } from "./types";

export const conversionStages: FunnelStage[] = [
  {
    key: "lead",
    label: "Novo lead",
    leadStatus: "Novo",
    description: "Pessoa respondeu a pesquisa e ainda precisa de abordagem inicial.",
  },
  {
    key: "contacted",
    label: "Contato iniciado",
    leadStatus: "Mensagem enviada",
    description: "Diego já chamou no WhatsApp e deve acompanhar a resposta.",
  },
  {
    key: "diagnostic_scheduled",
    label: "Diagnóstico agendado",
    leadStatus: "Diagnóstico agendado",
    description: "Existe conversa marcada para aprofundar dores, rotina e objetivos.",
  },
  {
    key: "pilot_offered",
    label: "Piloto oferecido",
    leadStatus: "Piloto oferecido",
    description: "Pessoa recebeu proposta de piloto, programa inicial ou próximo passo estruturado.",
  },
  {
    key: "converted",
    label: "Virou aluno",
    leadStatus: "Virou aluno",
    description: "Lead entrou em uma jornada paga ou acompanhamento ativo.",
  },
  {
    key: "lost",
    label: "Sem interesse",
    leadStatus: "Sem interesse agora",
    description: "Lead não avançou agora, mas pode entrar em nutrição futura.",
  },
  {
    key: "partner",
    label: "Parceiro potencial",
    leadStatus: "Parceiro potencial",
    description: "Academia, professor ou profissional para parceria B2B.",
  },
  {
    key: "archived",
    label: "Arquivado",
    leadStatus: "Arquivado",
    description: "Lead sem continuidade prevista.",
  },
];

export function conversionStatusFromLeadStatus(status?: string | null): ConversionStatus {
  const stage = conversionStages.find((item) => item.leadStatus === status);
  return stage?.key ?? "lead";
}

export function leadStatusFromConversionStatus(status?: string | null) {
  const stage = conversionStages.find((item) => item.key === status);
  return stage?.leadStatus ?? "Novo";
}

export function getConversionLabel(status?: string | null) {
  const stage = conversionStages.find((item) => item.key === status);
  return stage?.label ?? "Novo lead";
}

export function getConversionRate(total: number, converted: number) {
  if (!total) return 0;
  return Math.round((converted / total) * 1000) / 10;
}

export function isConvertedLead(lead: Pick<LeadSummary, "lead_status" | "conversion_status">) {
  return lead.lead_status === "Virou aluno" || lead.conversion_status === "converted";
}

export function isLostLead(lead: Pick<LeadSummary, "lead_status" | "conversion_status">) {
  return lead.lead_status === "Sem interesse agora" || lead.conversion_status === "lost";
}

export function isArchivedLead(lead: Pick<LeadSummary, "lead_status" | "conversion_status">) {
  return lead.lead_status === "Arquivado" || lead.conversion_status === "archived";
}

export function isPartnerLead(lead: Pick<LeadSummary, "lead_status" | "conversion_status">) {
  return lead.lead_status === "Parceiro potencial" || lead.conversion_status === "partner";
}
