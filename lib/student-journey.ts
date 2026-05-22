import type { JourneyClient } from "./types";

export const clientStatuses = [
  "ativo",
  "pausado",
  "risco_de_saida",
  "potencial_upgrade",
  "convertido",
  "arquivado",
] as const;

export const clientTypes = ["aluno_atual", "lead", "ex_aluno", "parceiro"] as const;

export const surveyStatuses = ["nao_enviada", "enviada", "respondida", "dispensada"] as const;

export const priorityLabels: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const clientStatusLabels: Record<string, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  risco_de_saida: "Risco de saída",
  potencial_upgrade: "Potencial upgrade",
  convertido: "Convertido",
  arquivado: "Arquivado",
};

export const clientTypeLabels: Record<string, string> = {
  aluno_atual: "Aluno atual",
  lead: "Lead",
  ex_aluno: "Ex-aluno",
  parceiro: "Parceiro",
};

export const surveyStatusLabels: Record<string, string> = {
  nao_enviada: "Não enviada",
  enviada: "Enviada",
  respondida: "Respondida",
  dispensada: "Dispensada",
};

export const suggestedProgramsByGoal = [
  { term: "corrida", program: "Corredor Forte" },
  { term: "maratona", program: "Corredor Forte" },
  { term: "lesão", program: "Treino com Segurança" },
  { term: "dor", program: "Treino com Segurança" },
  { term: "emagrec", program: "Treino Inteligente para Rotina Real" },
  { term: "longevidade", program: "Força e Autonomia 45+" },
  { term: "autonomia", program: "Força e Autonomia 45+" },
  { term: "consciência", program: "Corpo, Energia e Presença" },
  { term: "respiração", program: "Corpo, Energia e Presença" },
];

function lower(value?: string | null) {
  return (value ?? "").toLowerCase();
}

export function suggestProgramForClient(client: Partial<JourneyClient>) {
  const text = [
    client.main_goal,
    client.secondary_goals,
    client.known_limitations,
    client.training_history,
    client.diego_memory_notes,
    client.audio_transcription,
    client.structured_summary,
  ]
    .map(lower)
    .join(" ");

  const match = suggestedProgramsByGoal.find((item) => text.includes(item.term));
  return match?.program ?? "Jornada Personal Extrema - ciclo personalizado";
}

export function buildNextJourneyStep(client: Partial<JourneyClient>) {
  const status = client.current_status ?? "ativo";
  const surveyStatus = client.personalized_survey_status ?? "nao_enviada";

  if (surveyStatus === "nao_enviada") {
    return "Enviar pesquisa personalizada curta para atualizar percepção, dores atuais e próximos objetivos sem recomeçar do zero.";
  }

  if (status === "risco_de_saida") {
    return "Agendar conversa de retenção: entender queda de constância, ajustar rotina e propor meta de 14 dias.";
  }

  if (status === "potencial_upgrade") {
    return "Apresentar nova etapa da jornada com relatório de evolução, meta clara e possível programa premium.";
  }

  return "Revisar histórico conhecido, confirmar objetivo atual e definir próximo ciclo de evolução com data de reavaliação.";
}

export function buildTechOpportunities(client: Partial<JourneyClient>) {
  const text = [client.main_goal, client.secondary_goals, client.known_limitations, client.training_history, client.diego_memory_notes]
    .map(lower)
    .join(" ");

  const opportunities = new Set<string>();

  opportunities.add("Relatório mensal de evolução com frequência, cargas, percepção de esforço e próximos focos.");
  opportunities.add("Check-in rápido por WhatsApp após treinos-chave para manter aderência.");

  if (text.includes("corrida") || text.includes("pace")) {
    opportunities.add("Controle simples de corrida: volume semanal, fortalecimento e sinais de sobrecarga.");
  }

  if (text.includes("tempo") || text.includes("agenda") || text.includes("rotina")) {
    opportunities.add("Agenda de treinos realista com lembretes e plano B para semanas difíceis.");
  }

  if (text.includes("dor") || text.includes("lesão") || text.includes("joelho") || text.includes("lombar")) {
    opportunities.add("Registro de dor/desconforto antes e depois dos treinos para ajustar carga com segurança.");
  }

  if (text.includes("consciência") || text.includes("respiração") || text.includes("energia")) {
    opportunities.add("Biblioteca curta de respiração, presença e preparação mental antes do treino.");
  }

  return Array.from(opportunities).join("\n");
}

export function normalizeClientPayload(input: Record<string, unknown>) {
  const nullable = (value: unknown) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  };

  const fullName = nullable(input.full_name ?? input.fullName ?? input.nome ?? input.name);
  const whatsapp = nullable(input.whatsapp ?? input.celular ?? input.telefone);

  return {
    full_name: fullName,
    whatsapp,
    email: nullable(input.email),
    birth_date: nullable(input.birth_date ?? input.birthDate ?? input.data_nascimento),
    age_range: nullable(input.age_range ?? input.ageRange ?? input.faixa_etaria),
    city: nullable(input.city ?? input.cidade),
    neighborhood: nullable(input.neighborhood ?? input.bairro),
    current_status: nullable(input.current_status ?? input.currentStatus) ?? "ativo",
    client_type: nullable(input.client_type ?? input.clientType) ?? "aluno_atual",
    training_location: nullable(input.training_location ?? input.trainingLocation ?? input.local_treino),
    weekly_frequency: nullable(input.weekly_frequency ?? input.weeklyFrequency ?? input.frequencia_semanal),
    usual_days: nullable(input.usual_days ?? input.usualDays ?? input.dias_habituais),
    usual_time: nullable(input.usual_time ?? input.usualTime ?? input.horario_habitual),
    main_goal: nullable(input.main_goal ?? input.mainGoal ?? input.objetivo_principal),
    secondary_goals: nullable(input.secondary_goals ?? input.secondaryGoals ?? input.objetivos_secundarios),
    known_limitations: nullable(input.known_limitations ?? input.knownLimitations ?? input.limitacoes),
    health_notes: nullable(input.health_notes ?? input.healthNotes ?? input.observacoes_saude),
    training_history: nullable(input.training_history ?? input.trainingHistory ?? input.historico_treino),
    diego_memory_notes: nullable(input.diego_memory_notes ?? input.diegoMemoryNotes ?? input.memoria_diego ?? input.narrativa),
    audio_transcription: nullable(input.audio_transcription ?? input.audioTranscription ?? input.transcricao_audio),
    structured_summary: nullable(input.structured_summary ?? input.structuredSummary ?? input.resumo_estruturado),
    next_journey_step: nullable(input.next_journey_step ?? input.nextJourneyStep ?? input.proxima_etapa),
    suggested_program: nullable(input.suggested_program ?? input.suggestedProgram ?? input.programa_sugerido),
    tech_opportunities: nullable(input.tech_opportunities ?? input.techOpportunities ?? input.oportunidades_tecnologicas),
    personalized_survey_status: nullable(input.personalized_survey_status ?? input.personalizedSurveyStatus) ?? "nao_enviada",
    priority: nullable(input.priority ?? input.prioridade) ?? "media",
    internal_notes: nullable(input.internal_notes ?? input.internalNotes ?? input.observacoes_internas),
    last_contact_at: nullable(input.last_contact_at ?? input.lastContactAt),
    next_contact_at: nullable(input.next_contact_at ?? input.nextContactAt),
  };
}

export function buildPersonalizedSurveyMessage(client: JourneyClient) {
  const firstName = client.full_name.split(" ")[0] || "tudo bem";
  return `Oi, ${firstName}. Aqui é o Diego Montagnini. Estou organizando melhor a sua Jornada Personal Extrema para que o acompanhamento fique ainda mais personalizado.\n\nComo eu já conheço boa parte da sua rotina e histórico, esta pesquisa é curta: a ideia é atualizar o que mudou, confirmar seus objetivos atuais e entender como posso te ajudar melhor na próxima etapa.\n\nPode responder por aqui? ${client.personalized_survey_link ?? "LINK_DA_PESQUISA_PERSONALIZADA"}`;
}
