import type { JourneyClient } from "./types";

export function buildAudioMemoryPrompt(client?: Partial<JourneyClient>) {
  const name = client?.full_name ?? "[nome do aluno]";
  return `Você é um assistente de organização profissional para a Jornada Personal Extrema do Diego Montagnini.

Contexto: Diego já acompanha o aluno ${name} e gravou/ditou uma narrativa com informações que ele já sabe. O objetivo não é criar diagnóstico médico, nem inventar dados. O objetivo é transformar a memória profissional do Diego em um cadastro estruturado para orientar a próxima etapa da jornada.

Tarefas:
1. Extraia apenas informações citadas ou claramente inferidas da narrativa.
2. Separe o que Diego já sabe e não precisa perguntar novamente.
3. Identifique objetivos, dores, barreiras, preferências, rotina, histórico de treino e pontos de atenção.
4. Aponte informações que ainda precisam ser confirmadas com o aluno.
5. Sugira a próxima etapa da Jornada Personal Extrema.
6. Sugira oportunidades tecnológicas úteis: relatório, check-in, lembrete, controle de treino, controle de dor, pesquisa personalizada ou agenda.
7. Use linguagem profissional, cuidadosa e sem promessas de cura ou tratamento.

Formato de resposta:

NOME DO ALUNO:

HISTÓRICO CONHECIDO:

O QUE NÃO DEVE SER PERGUNTADO DE NOVO:

OBJETIVOS ATUAIS OU PROVÁVEIS:

DORES, BARREIRAS E CUIDADOS:

ROTINA E PREFERÊNCIAS:

PONTOS A CONFIRMAR COM O ALUNO:

PRÓXIMA ETAPA SUGERIDA:

OPORTUNIDADES TECNOLÓGICAS:

OBSERVAÇÕES INTERNAS PARA DIEGO:

Cole abaixo a transcrição ou narrativa do Diego:`;
}

export function buildNarrativeTemplate() {
  return `Modelo para Diego gravar ou ditar:

“Vou falar sobre [nome do aluno]. Ele/ela treina comigo há [tempo aproximado]. Hoje costuma treinar [dias/horários/local]. O principal objetivo dele/dela é [objetivo]. Eu já sei que ele/ela tem [limitações/cuidados/preferências]. O que já funcionou foi [histórico]. O que atrapalha a constância é [barreiras]. A próxima etapa que eu imagino é [hipótese]. O que ainda preciso confirmar é [pontos pendentes].”`;
}
