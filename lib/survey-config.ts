import type { Audience, Question } from "./types";

export const audiences: Audience[] = [
  { slug: "alunos-atuais", name: "Alunos atuais", description: "Entender o que mais gera valor e o que pode melhorar.", freeOffer: "Relatório gratuito de evolução mensal" },
  { slug: "ex-alunos", name: "Ex-alunos", description: "Descobrir por que pararam e qual formato poderia trazê-los de volta.", freeOffer: "Reavaliação gratuita de retorno" },
  { slug: "corredores", name: "Corredores amadores", description: "Mapear dores, lesões, metas e fortalecimento para corrida.", freeOffer: "Checklist Corredor Forte" },
  { slug: "longevidade-45", name: "Adultos 45+ e longevidade", description: "Avaliar força, autonomia, segurança, energia e mobilidade.", freeOffer: "Miniavaliação Força e Autonomia 45+" },
  { slug: "rotina-corrida", name: "Pessoas com rotina corrida", description: "Encontrar soluções realistas para pouco tempo e baixa constância.", freeOffer: "Plano com 3 treinos de 20 minutos" },
  { slug: "consciencia-corporal", name: "Consciência corporal", description: "Entender interesse em respiração, presença, energia e movimento com propósito.", freeOffer: "Áudio/PDF de respiração e presença antes do treino" },
  { slug: "parceiros", name: "Academias, professores e parceiros", description: "Mapear oportunidades de parceria, retenção e jornada do aluno.", freeOffer: "Diagnóstico gratuito de retenção e acompanhamento de alunos" },
];

export const commonQuestions: Question[] = [
  {
    key: "frase_perfil",
    title: "Qual frase melhor descreve você hoje?",
    type: "single_choice",
    required: true,
    allowComment: true,
    category: "perfil",
    options: [
      { value: "voltar_treinar", label: "Quero começar ou voltar a treinar", tags: ["recomeco"] },
      { value: "sem_evolucao", label: "Já treino, mas sinto que estou sem evolução", tags: ["performance"] },
      { value: "corredor", label: "Corro ou quero começar a correr", tags: ["corredor"] },
      { value: "longevidade", label: "Quero envelhecer com mais força e autonomia", tags: ["longevidade"] },
      { value: "rotina_corrida", label: "Tenho pouco tempo e preciso de algo objetivo", tags: ["rotina"] },
      { value: "dor_limitacao", label: "Tenho dores, limitações ou insegurança para treinar", tags: ["seguranca"] },
      { value: "consciencia", label: "Busco mais consciência corporal, energia e equilíbrio", tags: ["consciencia"] },
      { value: "parceiro", label: "Sou profissional/parceiro e quero avaliar colaboração", tags: ["parceiro"] }
    ]
  },
  {
    key: "objetivo_principal",
    title: "Qual é seu principal objetivo neste momento?",
    type: "single_choice",
    required: true,
    allowComment: true,
    category: "desejo",
    options: [
      { value: "emagrecer", label: "Emagrecer" },
      { value: "massa", label: "Ganhar massa muscular" },
      { value: "forca", label: "Melhorar força" },
      { value: "disposicao", label: "Melhorar disposição" },
      { value: "mobilidade", label: "Melhorar mobilidade" },
      { value: "dor", label: "Reduzir dores ou limitações" },
      { value: "corrida", label: "Correr melhor" },
      { value: "lesoes", label: "Evitar lesões" },
      { value: "autonomia", label: "Envelhecer com mais autonomia" },
      { value: "constancia", label: "Ter mais disciplina e constância" },
      { value: "autoestima", label: "Melhorar autoestima" },
      { value: "consciencia", label: "Melhorar consciência corporal" }
    ]
  },
  {
    key: "maiores_dificuldades",
    title: "Quais são suas maiores dificuldades para manter uma rotina de treino ou cuidado com o corpo?",
    type: "multiple_choice",
    required: true,
    allowComment: true,
    category: "dor",
    options: [
      { value: "falta_tempo", label: "Falta de tempo" },
      { value: "falta_disciplina", label: "Falta de disciplina" },
      { value: "falta_orientacao", label: "Falta de orientação" },
      { value: "treino_generico", label: "Treinos genéricos" },
      { value: "dor_desconforto", label: "Dor ou desconforto" },
      { value: "medo_machucar", label: "Medo de se machucar" },
      { value: "cansaco", label: "Cansaço" },
      { value: "vergonha", label: "Vergonha de treinar" },
      { value: "sem_resultado", label: "Falta de resultado" },
      { value: "comeco_paro", label: "Começo e paro várias vezes" },
      { value: "nao_sei_certo", label: "Não sei se estou fazendo certo" },
      { value: "sem_acompanhamento", label: "Falta de acompanhamento próximo" }
    ]
  },
  {
    key: "deep_dive_mudanca",
    title: "O que mudaria na sua vida se você alcançasse esse objetivo?",
    type: "free_text",
    required: false,
    category: "deep_dive"
  },
  {
    key: "deep_dive_incomodo",
    title: "O que você não quer mais precisar sentir, fazer ou enfrentar em relação ao seu corpo e rotina?",
    type: "free_text",
    required: false,
    category: "deep_dive"
  },
  {
    key: "frequencia_realista",
    title: "Quantas vezes por semana você conseguiria se dedicar de forma realista?",
    type: "single_choice",
    required: true,
    allowComment: true,
    category: "rotina",
    options: [
      { value: "1", label: "1 vez por semana" },
      { value: "2", label: "2 vezes por semana" },
      { value: "3", label: "3 vezes por semana" },
      { value: "4", label: "4 vezes por semana" },
      { value: "5_mais", label: "5 vezes ou mais" },
      { value: "nao_sei", label: "Ainda não sei" }
    ]
  },
  {
    key: "formato_preferido",
    title: "Qual formato de acompanhamento faria mais sentido para você?",
    type: "single_choice",
    required: true,
    allowComment: true,
    category: "oferta",
    options: [
      { value: "presencial", label: "Presencial individual" },
      { value: "online", label: "Online individual" },
      { value: "hibrido", label: "Híbrido" },
      { value: "grupo", label: "Grupo pequeno" },
      { value: "consultoria", label: "Consultoria mensal" },
      { value: "programa", label: "Programa de 8 a 12 semanas" },
      { value: "nao_sei", label: "Ainda não sei" }
    ]
  },
  {
    key: "interesse_piloto",
    title: "Você teria interesse em participar de um diagnóstico gratuito ou piloto com o Diego?",
    type: "single_choice",
    required: true,
    allowComment: true,
    category: "oferta",
    options: [
      { value: "sim", label: "Sim, tenho interesse" },
      { value: "talvez", label: "Talvez, quero entender melhor" },
      { value: "nao_agora", label: "Não agora" },
      { value: "conteudo", label: "Tenho interesse apenas em conteúdo gratuito" },
      { value: "parceria", label: "Sou parceiro/profissional e quero conversar" }
    ]
  }
];

export const audienceQuestions: Question[] = [
  { key: "corrida_dificuldades", title: "Qual sua maior dificuldade como corredor?", type: "multiple_choice", required: true, allowComment: true, category: "dor", audiences: ["corredores"], options: [
    { value: "joelho", label: "Dor no joelho" }, { value: "canela", label: "Dor na canela" }, { value: "quadril", label: "Dor no quadril" }, { value: "lombar", label: "Dor lombar" }, { value: "forca", label: "Falta de força" }, { value: "folego", label: "Falta de fôlego" }, { value: "pace", label: "Não melhorar pace" }, { value: "lesao", label: "Medo de lesão" }, { value: "musculacao_corrida", label: "Não saber combinar corrida e musculação" }
  ] },
  { key: "corrida_fortalecimento", title: "Você faz fortalecimento específico para corrida?", type: "single_choice", required: true, allowComment: true, category: "rotina", audiences: ["corredores"], options: [
    { value: "sim", label: "Sim" }, { value: "as_vezes", label: "Às vezes" }, { value: "nao", label: "Não" }, { value: "nao_sei", label: "Não sei o que seria ideal" }
  ] },
  { key: "longevidade_preocupacao", title: "O que mais preocupa você em relação ao envelhecimento?", type: "multiple_choice", required: true, allowComment: true, category: "dor", audiences: ["longevidade-45"], options: [
    { value: "perder_forca", label: "Perder força" }, { value: "perder_autonomia", label: "Perder autonomia" }, { value: "dores", label: "Sentir dores" }, { value: "dependencia", label: "Depender de outras pessoas" }, { value: "equilibrio", label: "Cair ou perder equilíbrio" }, { value: "peso", label: "Ganhar peso" }, { value: "disposicao", label: "Perder disposição" }, { value: "familia", label: "Não conseguir acompanhar família/netos" }
  ] },
  { key: "rotina_tempo_sessao", title: "Quanto tempo real você teria por sessão?", type: "single_choice", required: true, allowComment: true, category: "rotina", audiences: ["rotina-corrida"], options: [
    { value: "20", label: "Até 20 minutos" }, { value: "30", label: "30 minutos" }, { value: "45", label: "45 minutos" }, { value: "60", label: "1 hora" }, { value: "depende", label: "Depende do dia" }
  ] },
  { key: "consciencia_temas", title: "Quais temas mais te interessam?", type: "multiple_choice", required: true, allowComment: true, category: "desejo", audiences: ["consciencia-corporal"], options: [
    { value: "respiracao", label: "Respiração" }, { value: "presenca", label: "Presença" }, { value: "consciencia_corporal", label: "Consciência corporal" }, { value: "energia", label: "Energia" }, { value: "disciplina", label: "Disciplina" }, { value: "autoconhecimento", label: "Autoconhecimento" }, { value: "estresse", label: "Redução de estresse" }
  ] },
  { key: "parceiros_dificuldade", title: "Qual maior dificuldade com alunos/clientes hoje?", type: "multiple_choice", required: true, allowComment: true, category: "dor", audiences: ["parceiros"], options: [
    { value: "retencao", label: "Retenção de alunos" }, { value: "frequencia", label: "Baixa frequência" }, { value: "acompanhamento", label: "Falta de acompanhamento" }, { value: "abandono", label: "Abandono nos primeiros meses" }, { value: "integracao", label: "Pouca integração entre profissionais" }, { value: "processo", label: "Falta de processo" }, { value: "premium", label: "Dificuldade de vender programas premium" }
  ] },
  { key: "aluno_atual_valor", title: "O que você mais valoriza no acompanhamento atual?", type: "multiple_choice", required: true, allowComment: true, category: "desejo", audiences: ["alunos-atuais"], options: [
    { value: "atencao", label: "Atenção individual" }, { value: "tecnica", label: "Conhecimento técnico" }, { value: "seguranca", label: "Segurança" }, { value: "incentivo", label: "Incentivo" }, { value: "rotina", label: "Adaptação à rotina" }, { value: "correcao", label: "Correção de movimento" }, { value: "cuidado", label: "Cuidado humano" }
  ] },
  { key: "ex_aluno_motivo", title: "Por qual motivo você parou o acompanhamento?", type: "single_choice", required: true, allowComment: true, category: "dor", audiences: ["ex-alunos"], options: [
    { value: "tempo", label: "Falta de tempo" }, { value: "financeiro", label: "Questão financeira" }, { value: "rotina", label: "Mudança de rotina" }, { value: "cidade", label: "Mudança de cidade" }, { value: "prioridade", label: "Falta de prioridade" }, { value: "constancia", label: "Não consegui manter constância" }, { value: "sozinho", label: "Preferi treinar sozinho" }, { value: "outro", label: "Outro motivo" }
  ] }
];

export function getAudience(slug: string) {
  return audiences.find((audience) => audience.slug === slug);
}

export function getQuestionsForAudience(slug: string) {
  return [
    ...commonQuestions,
    ...audienceQuestions.filter((question) => question.audiences?.includes(slug)),
    { key: "comentario_livre", title: "Quer deixar algum comentário livre?", type: "free_text", required: false, category: "deep_dive" } as Question
  ];
}

export function questionTypeLabel(type: string) {
  if (type === "single_choice") return "Escolha única";
  if (type === "multiple_choice") return "Múltipla escolha";
  return "Texto livre";
}
