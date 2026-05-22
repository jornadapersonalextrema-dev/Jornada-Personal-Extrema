import type { LeadSummary } from "./types";
import { getPlaybookByAudience } from "./journey-playbook";

const DAY_MS = 24 * 60 * 60 * 1000;

export type FollowupReason =
  | "novo"
  | "vencido"
  | "sem_mensagem"
  | "pos_mensagem"
  | "pos_diagnostico"
  | "pos_piloto"
  | "nutricao"
  | "convertido"
  | "parceiro"
  | "arquivado";

export type FollowupSuggestion = {
  reason: FollowupReason;
  priority: "alta" | "media" | "baixa";
  title: string;
  action: string;
  whatsappText: string;
  recommendedNextContactDays: number;
};

export function daysSince(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / DAY_MS);
}

export function isFollowupOverdue(lead: LeadSummary) {
  if (!lead.next_contact_at) return false;
  const date = new Date(lead.next_contact_at);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

export function isWithoutRecentMessage(lead: LeadSummary, days = 7) {
  const reference = lead.last_message_at ?? lead.created_at;
  const diff = daysSince(reference);
  return diff !== null && diff >= days;
}

export function getSuggestedProgram(audienceSlug?: string | null) {
  const playbook = getPlaybookByAudience(audienceSlug ?? "");
  return playbook.nextProgram;
}

export function getWeeklyBucket(lead: LeadSummary) {
  if (lead.lead_status === "Virou aluno") return "Conversões";
  if (lead.lead_status === "Diagnóstico agendado") return "Diagnósticos";
  if (lead.lead_status === "Piloto oferecido") return "Pilotos";
  if (isFollowupOverdue(lead)) return "Follow-up vencido";
  if (lead.priority === "alta") return "Prioridade alta";
  return "Nutrição";
}

export function buildFollowupSuggestion(lead: LeadSummary): FollowupSuggestion {
  const firstName = lead.name?.split(" ")[0] || "tudo bem";
  const playbook = getPlaybookByAudience(lead.audience_slug);
  const program = lead.program_suggested || playbook.nextProgram;
  const overdue = isFollowupOverdue(lead);
  const withoutMessage = isWithoutRecentMessage(lead, 7);
  const followupCount = lead.followup_count ?? 0;

  if (lead.lead_status === "Virou aluno" || lead.conversion_status === "converted") {
    return {
      reason: "convertido",
      priority: "baixa",
      title: "Aluno convertido: acompanhar evolução",
      action: "Registrar início da jornada e combinar primeira reavaliação.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Passando para alinhar o começo da sua Jornada Personal Extrema e deixar claro o primeiro foco: evolução com constância, segurança e acompanhamento próximo.`,
      recommendedNextContactDays: 7,
    };
  }

  if (lead.lead_status === "Parceiro potencial" || lead.conversion_status === "partner") {
    return {
      reason: "parceiro",
      priority: "media",
      title: "Parceria: propor conversa objetiva",
      action: "Marcar conversa sobre retenção, jornada do aluno e oportunidades de colaboração.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Pensei em conversarmos de forma objetiva sobre como a Jornada Personal Extrema pode ajudar em retenção, acompanhamento e experiência dos alunos. Faz sentido marcarmos 20 minutos?`,
      recommendedNextContactDays: 3,
    };
  }

  if (lead.lead_status === "Arquivado" || lead.conversion_status === "archived") {
    return {
      reason: "arquivado",
      priority: "baixa",
      title: "Arquivado: sem ação imediata",
      action: "Não insistir. Retomar apenas se houver novo sinal de interesse.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Estou deixando seu contato salvo para, se fizer sentido no futuro, te enviar conteúdos úteis sobre treino, rotina e evolução com segurança.`,
      recommendedNextContactDays: 30,
    };
  }

  if (lead.lead_status === "Piloto oferecido") {
    return {
      reason: "pos_piloto",
      priority: overdue ? "alta" : "media",
      title: "Follow-up do piloto",
      action: "Perguntar se a pessoa quer começar pelo piloto ou ajustar formato.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Queria saber se fez sentido para você começarmos pelo piloto da ${program}. A ideia é ser algo simples, com começo claro, sem treino genérico e ajustado à sua rotina.`,
      recommendedNextContactDays: 2,
    };
  }

  if (lead.lead_status === "Diagnóstico agendado") {
    return {
      reason: "pos_diagnostico",
      priority: overdue ? "alta" : "media",
      title: "Confirmar diagnóstico",
      action: "Confirmar horário e reforçar que a conversa é para entender dor, rotina e objetivo.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Passando para confirmar nossa conversa de diagnóstico. A ideia é entender sua rotina, o que você já tentou e qual caminho mais realista para você evoluir com segurança.`,
      recommendedNextContactDays: 1,
    };
  }

  if (lead.lead_status === "Mensagem enviada") {
    return {
      reason: "pos_mensagem",
      priority: overdue || withoutMessage ? "alta" : "media",
      title: "Retomar após primeira mensagem",
      action: "Enviar lembrete curto com oferta gratuita e pergunta de continuidade.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Passando só para ver se você conseguiu olhar minha mensagem sobre a ${playbook.freeOffer}. Se fizer sentido, posso te mandar esse material gratuito e depois te faço 3 perguntas rápidas para entender melhor seu momento.`,
      recommendedNextContactDays: followupCount >= 2 ? 14 : 3,
    };
  }

  if (lead.lead_status === "Sem interesse agora" || lead.conversion_status === "lost") {
    return {
      reason: "nutricao",
      priority: "baixa",
      title: "Nutrição sem pressão",
      action: "Enviar conteúdo útil em 30 dias, sem insistir na venda.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Sem pressão nenhuma: pensei em te enviar um conteúdo simples sobre ${playbook.positioning.toLowerCase()}. Pode ser útil para quando você decidir retomar com mais calma.`,
      recommendedNextContactDays: 30,
    };
  }

  if (overdue) {
    return {
      reason: "vencido",
      priority: "alta",
      title: "Próximo contato vencido",
      action: "Priorizar hoje. Enviar mensagem curta e personalizada.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas na Jornada Personal Extrema e não queria deixar seu diagnóstico parado. Pelo seu perfil, acredito que o primeiro passo mais útil seja: ${playbook.freeOffer}. Posso te enviar?`,
      recommendedNextContactDays: 3,
    };
  }

  if (withoutMessage) {
    return {
      reason: "sem_mensagem",
      priority: "alta",
      title: "Lead sem mensagem recente",
      action: "Retomar com uma pergunta simples e uma oferta gratuita.",
      whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Passando para retomar seu diagnóstico da Jornada Personal Extrema. O que seria mais útil para você agora: receber o material gratuito, marcar uma conversa rápida ou apenas acompanhar conteúdos por enquanto?`,
      recommendedNextContactDays: 7,
    };
  }

  return {
    reason: "novo",
    priority: lead.priority === "alta" ? "alta" : "media",
    title: "Abordagem inicial",
    action: "Enviar mensagem inicial Deep Dive e entregar a oferta gratuita.",
    whatsappText: `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas no diagnóstico e percebi que seu perfil tem relação com: ${lead.detected_profile || playbook.label}. Antes de pensar em treino, quero entender sua rotina e o que realmente precisa mudar. Posso te enviar gratuitamente este primeiro material: ${playbook.freeOffer}?`,
    recommendedNextContactDays: 2,
  };
}

export function getNextContactDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}
