export type LeadStatus =
  | "Novo"
  | "Mensagem enviada"
  | "Diagnóstico agendado"
  | "Piloto oferecido"
  | "Virou aluno"
  | "Sem interesse agora"
  | "Parceiro potencial"
  | "Arquivado";

export type JourneyPlaybook = {
  audienceSlug: string;
  label: string;
  positioning: string;
  oceanBlueAngle: string;
  freeOffer: string;
  firstAction: string;
  deepDiveFocus: string[];
  discoveryQuestions: string[];
  nextProgram: string;
  caution: string;
};

export const leadStatuses: LeadStatus[] = [
  "Novo",
  "Mensagem enviada",
  "Diagnóstico agendado",
  "Piloto oferecido",
  "Virou aluno",
  "Sem interesse agora",
  "Parceiro potencial",
  "Arquivado",
];

export const statusFlow: LeadStatus[] = [
  "Novo",
  "Mensagem enviada",
  "Diagnóstico agendado",
  "Piloto oferecido",
  "Virou aluno",
];

export const playbooks: JourneyPlaybook[] = [
  {
    audienceSlug: "alunos-atuais",
    label: "Alunos atuais",
    positioning: "Retenção, evolução percebida e valorização da jornada já iniciada.",
    oceanBlueAngle: "Transformar acompanhamento em experiência premium, mostrando progresso e próximos focos em vez de apenas entregar treinos.",
    freeOffer: "Relatório gratuito de evolução mensal",
    firstAction: "Enviar uma devolutiva agradecendo a confiança e pedir autorização para montar um mini-relatório de evolução.",
    deepDiveFocus: [
      "O que fez a pessoa continuar?",
      "Qual evolução ela ainda não percebe claramente?",
      "O que aumentaria a percepção de valor do acompanhamento?",
    ],
    discoveryQuestions: [
      "O que você mais sente que evoluiu desde que começou?",
      "O que ainda gostaria que fosse mais claro no acompanhamento?",
      "Qual meta faria você sentir que os próximos 90 dias valeram muito a pena?",
    ],
    nextProgram: "Plano de evolução trimestral com relatório mensal",
    caution: "Não tratar como venda nova. O foco é retenção, encantamento e indicação.",
  },
  {
    audienceSlug: "ex-alunos",
    label: "Ex-alunos",
    positioning: "Reativação sem pressão, entendendo o motivo real da pausa.",
    oceanBlueAngle: "Em vez de insistir para voltar, oferecer um retorno inteligente e possível para a fase atual da vida.",
    freeOffer: "Reavaliação gratuita de retorno",
    firstAction: "Enviar uma mensagem leve reconhecendo a pausa e oferecendo uma reavaliação sem compromisso.",
    deepDiveFocus: [
      "Por que parou?",
      "O que mudou na rotina?",
      "Qual formato seria mais fácil de manter agora?",
    ],
    discoveryQuestions: [
      "O que mais atrapalhou sua continuidade naquela época?",
      "O que precisaria ser diferente para funcionar agora?",
      "Você preferiria algo presencial, online, híbrido ou mais enxuto?",
    ],
    nextProgram: "Programa Volta ao Movimento",
    caution: "Não usar tom de cobrança. A conversa deve parecer cuidado, não cobrança por retorno.",
  },
  {
    audienceSlug: "corredores",
    label: "Corredores amadores",
    positioning: "Evolução na corrida com força, mobilidade e prevenção de lesões.",
    oceanBlueAngle: "Não vender apenas planilha. Vender corpo preparado para correr melhor e sustentar evolução.",
    freeOffer: "Checklist Corredor Forte",
    firstAction: "Enviar o checklist e perguntar se a pessoa já faz fortalecimento específico para corrida.",
    deepDiveFocus: [
      "Medo de lesão",
      "Frustração por não melhorar pace",
      "Desejo de correr com segurança e constância",
    ],
    discoveryQuestions: [
      "Qual dor ou limitação mais aparece quando você corre?",
      "Você já faz fortalecimento ou só corre?",
      "Qual prova ou distância você gostaria de correr melhor nos próximos meses?",
    ],
    nextProgram: "Programa Corredor Forte",
    caution: "Evitar prometer melhora de pace sem avaliar rotina, carga, sono, histórico e fortalecimento.",
  },
  {
    audienceSlug: "longevidade-45",
    label: "Adultos 45+ e longevidade",
    positioning: "Força, segurança, mobilidade e autonomia para viver melhor.",
    oceanBlueAngle: "Sair da estética e falar de independência, energia, confiança e qualidade de vida.",
    freeOffer: "Miniavaliação Força e Autonomia 45+",
    firstAction: "Oferecer uma miniavaliação e perguntar qual atividade do dia a dia a pessoa quer fazer com mais facilidade.",
    deepDiveFocus: [
      "Medo de perder autonomia",
      "Perda de força ou equilíbrio",
      "Desejo de envelhecer com segurança e dignidade",
    ],
    discoveryQuestions: [
      "O que você quer continuar fazendo com independência nos próximos anos?",
      "Qual movimento ou atividade hoje gera insegurança?",
      "Você sente mais falta de força, equilíbrio, mobilidade ou disposição?",
    ],
    nextProgram: "Força e Autonomia 45+",
    caution: "Não prometer cura ou substituir médico/fisioterapeuta. Usar linguagem de segurança e acompanhamento.",
  },
  {
    audienceSlug: "rotina-corrida",
    label: "Pessoas com rotina corrida",
    positioning: "Treino realista para quem tem pouco tempo e precisa de constância.",
    oceanBlueAngle: "Não vender intensidade. Vender plano possível, objetivo e sustentável.",
    freeOffer: "Plano com 3 treinos de 20 minutos",
    firstAction: "Enviar os 3 treinos de 20 minutos e perguntar quais dias/horários seriam realistas.",
    deepDiveFocus: [
      "Culpa por não conseguir manter rotina",
      "Falta de tempo real",
      "Desejo de retomar controle sem exagero",
    ],
    discoveryQuestions: [
      "Em quais dias você realmente conseguiria treinar?",
      "Você prefere começar em casa, academia, condomínio ou parque?",
      "O que normalmente faz você abandonar a rotina?",
    ],
    nextProgram: "Treino Inteligente para Rotina Real",
    caution: "Evitar plano ambicioso demais. O diferencial é caber na vida real.",
  },
  {
    audienceSlug: "consciencia-corporal",
    label: "Consciência corporal",
    positioning: "Movimento com presença, energia, respiração e propósito.",
    oceanBlueAngle: "Integrar ciência do exercício com consciência corporal sem virar promessa espiritual ou terapêutica.",
    freeOffer: "Áudio/PDF de respiração e presença antes do treino",
    firstAction: "Enviar a prática curta de respiração/presença e perguntar o que a pessoa sente faltar nos treinos convencionais.",
    deepDiveFocus: [
      "Busca por presença",
      "Energia e vitalidade",
      "Relação mais consciente com o corpo",
    ],
    discoveryQuestions: [
      "Você busca algo mais leve, mais profundo ou mais disciplinado?",
      "O que falta nos treinos tradicionais para você?",
      "Como você definiria evolução verdadeira no seu momento atual?",
    ],
    nextProgram: "Corpo, Energia e Presença",
    caution: "Deixar claro que não substitui atendimento médico, psicológico, nutricional ou terapêutico.",
  },
  {
    audienceSlug: "parceiros",
    label: "Academias, professores e parceiros",
    positioning: "Processo, retenção, acompanhamento e jornada do aluno.",
    oceanBlueAngle: "Não vender aula. Vender melhoria de processo, experiência e continuidade do aluno.",
    freeOffer: "Diagnóstico gratuito de retenção e acompanhamento de alunos",
    firstAction: "Propor uma conversa para mapear onde alunos abandonam, perdem frequência ou deixam de perceber valor.",
    deepDiveFocus: [
      "Retenção",
      "Falta de processo",
      "Baixa continuidade no relacionamento com alunos",
    ],
    discoveryQuestions: [
      "Onde vocês mais perdem alunos hoje?",
      "Como acompanham alunos nos primeiros 30 dias?",
      "Existe rotina de reavaliação, mensagem ativa ou indicador de frequência?",
    ],
    nextProgram: "Consultoria Jornada do Aluno",
    caution: "Falar como parceiro de processo, não como concorrente de professores ou academias.",
  },
];

export function getPlaybookByAudience(audienceSlug?: string) {
  return playbooks.find((item) => item.audienceSlug === audienceSlug) ?? playbooks[0];
}

export function getStatusIndex(status?: string) {
  const index = statusFlow.findIndex((item) => item === status);
  return index >= 0 ? index : 0;
}

export function getNextActionByStatus(status: string | undefined, audienceSlug?: string) {
  const playbook = getPlaybookByAudience(audienceSlug);

  switch (status) {
    case "Novo":
      return `Enviar mensagem inicial em até 24h. ${playbook.firstAction}`;
    case "Mensagem enviada":
      return `Aguardar resposta e entregar a oferta gratuita: ${playbook.freeOffer}. Depois fazer uma pergunta de aprofundamento.`;
    case "Diagnóstico agendado":
      return "Antes da conversa, revisar respostas, dores, objetivo e comentários. Conduzir 15 a 30 minutos de diagnóstico, sem começar vendendo.";
    case "Piloto oferecido":
      return `Confirmar escopo, duração e critério de sucesso do piloto. Caminho natural: ${playbook.nextProgram}.`;
    case "Virou aluno":
      return "Registrar programa, definir primeira meta, combinar frequência e agendar reavaliação.";
    case "Sem interesse agora":
      return "Não insistir. Enviar conteúdo útil e programar retomada leve em 30 a 60 dias.";
    case "Parceiro potencial":
      return "Mapear operação, oportunidades de retenção e possibilidade de piloto de processo.";
    case "Arquivado":
      return "Sem ação imediata. Manter histórico para análise futura.";
    default:
      return `Enviar mensagem inicial e oferecer: ${playbook.freeOffer}.`;
  }
}

export function buildLeadWhatsappMessage(input: {
  name: string;
  detectedProfile?: string;
  audienceSlug?: string;
  status?: string;
}) {
  const firstName = input.name?.trim().split(" ")[0] || "tudo bem";
  const playbook = getPlaybookByAudience(input.audienceSlug);

  if (input.status === "Mensagem enviada") {
    return `Oi, ${firstName}. Passando para te enviar o material gratuito que comentei: ${playbook.freeOffer}. Depois que você olhar, me diga qual ponto mais fez sentido para sua rotina hoje.`;
  }

  if (input.status === "Diagnóstico agendado") {
    return `Oi, ${firstName}. Confirmando nossa conversa de diagnóstico da Jornada Personal Extrema. Vou olhar suas respostas com calma para entender melhor sua rotina, suas dores e o caminho mais seguro para você evoluir.`;
  }

  return `Oi, ${firstName}. Aqui é o Diego Montagnini. Vi suas respostas no diagnóstico da Jornada Personal Extrema e percebi que seu perfil está muito ligado a: ${input.detectedProfile || playbook.label}.

Antes de pensar em treino, quero entender melhor sua rotina, o que você já tentou e o que realmente precisa mudar para você evoluir com mais constância.

Posso te enviar gratuitamente este primeiro material: ${playbook.freeOffer}?`;
}

export const oceanBluePrinciples = [
  {
    title: "Não vender treino genérico",
    description: "Começar pelo diagnóstico, pela dor real e pelo momento de vida da pessoa.",
  },
  {
    title: "Traduzir exercício em vida real",
    description: "Falar de autonomia, energia, segurança, rotina, presença e constância.",
  },
  {
    title: "Oferecer próximo passo pequeno",
    description: "Checklist, miniavaliação, áudio, plano curto ou diagnóstico antes da proposta paga.",
  },
  {
    title: "Acompanhar a jornada",
    description: "Atualizar status, registrar próxima ação e manter relacionamento sem pressão.",
  },
];
