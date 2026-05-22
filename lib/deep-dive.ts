import { audiences } from "./survey-config";
import type { GeneratedMessage, SurveyPayload } from "./types";

function values(payload: SurveyPayload): string[] {
  return Object.values(payload.answers).flatMap((value) => Array.isArray(value) ? value : [value]).filter(Boolean);
}

function has(payload: SurveyPayload, terms: string[]) {
  const all = values(payload);
  return terms.some((term) => all.includes(term));
}

export function generateDeepDiveMessage(payload: SurveyPayload): GeneratedMessage {
  const audience = audiences.find((item) => item.slug === payload.audienceSlug);
  let detectedProfile = audience?.name ?? "Perfil geral";
  let freeOffer = audience?.freeOffer ?? "Diagnóstico inicial gratuito";
  let headline = "Primeira devolutiva personalizada";
  let nextStep = "Convidar para uma conversa rápida pelo WhatsApp com o Diego Montagnini.";
  let urgencyScore = 2;

  if (payload.audienceSlug === "corredores" || has(payload, ["corredor", "corrida", "lesoes", "lesao", "pace"])) {
    detectedProfile = "Corredor em busca de evolução com segurança";
    freeOffer = "Checklist Corredor Forte";
    headline = "Evoluir na corrida sem se machucar";
    urgencyScore += 2;
  }

  if (payload.audienceSlug === "longevidade-45" || has(payload, ["longevidade", "autonomia", "perder_forca", "perder_autonomia", "equilibrio", "dependencia"])) {
    detectedProfile = "Força e longevidade 45+";
    freeOffer = "Miniavaliação Força e Autonomia 45+";
    headline = "Força, segurança e autonomia para viver melhor";
    urgencyScore += 2;
  }

  if (payload.audienceSlug === "rotina-corrida" || has(payload, ["rotina_corrida", "falta_tempo", "20", "30"])) {
    detectedProfile = "Rotina corrida com necessidade de treino realista";
    freeOffer = "Plano com 3 treinos de 20 minutos";
    headline = "Treinar melhor mesmo com pouco tempo";
    urgencyScore += 1;
  }

  if (payload.audienceSlug === "consciencia-corporal" || has(payload, ["consciencia", "respiracao", "presenca", "energia", "autoconhecimento"])) {
    detectedProfile = "Consciência corporal, energia e presença";
    freeOffer = "Áudio/PDF de respiração e presença antes do treino";
    headline = "Movimento com mais presença, energia e propósito";
  }

  if (payload.audienceSlug === "parceiros" || has(payload, ["parceiro", "retencao", "processo", "premium"])) {
    detectedProfile = "Parceiro ou academia com oportunidade de jornada do aluno";
    freeOffer = "Diagnóstico gratuito de retenção e acompanhamento de alunos";
    headline = "Melhorar retenção e acompanhamento dos alunos";
    nextStep = "Propor conversa de parceria ou diagnóstico do processo atual.";
  }

  if (has(payload, ["sim", "parceria"])) urgencyScore += 2;
  if (has(payload, ["talvez", "conteudo"])) urgencyScore += 1;
  const interestLevel = urgencyScore >= 5 ? "alto" : urgencyScore >= 3 ? "medio" : "baixo";

  const deepDiveOpen = [payload.answers.deep_dive_mudanca, payload.answers.deep_dive_incomodo, payload.answers.comentario_livre]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join(" | ");

  const whatsappText = buildWhatsappText({
    name: payload.name,
    detectedProfile,
    freeOffer,
    headline,
    audienceSlug: payload.audienceSlug,
  });

  return {
    detectedProfile,
    freeOffer,
    headline,
    whatsappText,
    deepDiveSummary: deepDiveOpen || "A pessoa respondeu ao diagnóstico da Jornada Personal Extrema e pode receber uma abordagem inicial do Diego Montagnini baseada no perfil detectado.",
    nextStep,
    urgencyScore,
    interestLevel,
  };
}

function buildWhatsappText(input: { name: string; detectedProfile: string; freeOffer: string; headline: string; audienceSlug: string }) {
  const firstName = input.name?.split(" ")[0] || "tudo bem";

  if (input.audienceSlug === "corredores") {
    return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas no diagnóstico e percebi que seu principal ponto hoje é evoluir na corrida sem se machucar.\n\nMuita gente tenta correr mais aumentando volume ou intensidade, mas esquece que o corpo precisa de força, mobilidade e recuperação para sustentar essa evolução.\n\nPosso te enviar gratuitamente o ${input.freeOffer} e, se fizer sentido, depois conversamos sobre um caminho mais personalizado para sua rotina.`;
  }

  if (input.audienceSlug === "longevidade-45") {
    return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas e percebi que sua preocupação não é simplesmente “fazer exercício”, mas ganhar força, segurança e autonomia para viver melhor.\n\nO melhor caminho inicial costuma ser entender seu histórico, suas limitações e sua rotina para evitar treino genérico ou exagerado.\n\nPosso te oferecer gratuitamente a ${input.freeOffer} para mostrar quais pontos merecem mais atenção agora.`;
  }

  if (input.audienceSlug === "rotina-corrida") {
    return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas e percebi que seu maior desafio não parece ser falta de vontade, mas encaixar o treino em uma rotina que já está cheia.\n\nNesse caso, o caminho não é começar com algo pesado ou impossível de manter. O ideal é uma rotina curta, objetiva e realista.\n\nPosso te enviar gratuitamente o ${input.freeOffer} para você começar sem exagero.`;
  }

  if (input.audienceSlug === "consciencia-corporal") {
    return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas e percebi que você busca uma relação mais consciente com o corpo, unindo movimento, presença e energia.\n\nA ideia não é substituir nenhum cuidado médico ou terapêutico, mas usar treino, respiração e consciência corporal como apoio para rotina, disciplina e vitalidade.\n\nPosso te enviar gratuitamente um ${input.freeOffer}.`;
  }

  if (input.audienceSlug === "parceiros") {
    return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas e percebi uma oportunidade de conversarmos sobre jornada do aluno, retenção e acompanhamento mais próximo.\n\nMuitas academias e profissionais perdem oportunidade não por falta de técnica, mas por falta de processo e continuidade no relacionamento com o aluno.\n\nPosso te oferecer um ${input.freeOffer} para avaliarmos possíveis melhorias e parcerias.`;
  }

  return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas no diagnóstico e percebi que existe uma oportunidade de construir um caminho mais personalizado para sua rotina, seu corpo e seus objetivos.\n\nA ideia não é entregar um treino genérico, mas entender o que você já tentou, o que não funcionou e o que realmente precisa mudar para você evoluir com mais constância.\n\nPosso te enviar gratuitamente o material inicial: ${input.freeOffer}.`;
}
