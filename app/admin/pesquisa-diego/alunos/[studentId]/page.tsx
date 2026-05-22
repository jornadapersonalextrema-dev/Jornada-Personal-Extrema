"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { adminFetch, buildAdminApiUrl } from "@/lib/client-admin";
import { buildAudioMemoryPrompt } from "@/lib/audio-memory-prompts";
import { buildPersonalizedSurveyMessage, clientStatusLabels, clientTypeLabels, priorityLabels, surveyStatusLabels } from "@/lib/student-journey";
import type { JourneyClient } from "@/lib/types";

type FormState = Record<string, string>;

function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleString("pt-BR");
}

function studentToForm(student: JourneyClient): FormState {
  return {
    full_name: student.full_name ?? "",
    whatsapp: student.whatsapp ?? "",
    email: student.email ?? "",
    age_range: student.age_range ?? "",
    city: student.city ?? "",
    neighborhood: student.neighborhood ?? "",
    current_status: student.current_status ?? "ativo",
    client_type: student.client_type ?? "aluno_atual",
    training_location: student.training_location ?? "",
    weekly_frequency: student.weekly_frequency ?? "",
    usual_days: student.usual_days ?? "",
    usual_time: student.usual_time ?? "",
    main_goal: student.main_goal ?? "",
    secondary_goals: student.secondary_goals ?? "",
    known_limitations: student.known_limitations ?? "",
    health_notes: student.health_notes ?? "",
    training_history: student.training_history ?? "",
    diego_memory_notes: student.diego_memory_notes ?? "",
    audio_transcription: student.audio_transcription ?? "",
    structured_summary: student.structured_summary ?? "",
    next_journey_step: student.next_journey_step ?? "",
    suggested_program: student.suggested_program ?? "",
    tech_opportunities: student.tech_opportunities ?? "",
    personalized_survey_status: student.personalized_survey_status ?? "nao_enviada",
    personalized_survey_link: student.personalized_survey_link ?? "",
    priority: student.priority ?? "media",
    internal_notes: student.internal_notes ?? "",
    next_contact_at: toInputDateTime(student.next_contact_at),
    last_contact_at: toInputDateTime(student.last_contact_at),
  };
}

function StudentDetailContent() {
  const { studentId } = useParams<{ studentId: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [student, setStudent] = useState<JourneyClient | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function loadStudent() {
    try {
      setError(null);
      const response = await adminFetch(`/api/admin/students/${studentId}`, token);
      const data = (await response.json()) as { student?: JourneyClient; error?: string };
      if (!response.ok || !data.student) throw new Error(data.error ?? "Aluno não encontrado.");
      setStudent(data.student);
      setForm(studentToForm(data.student));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar aluno.");
    }
  }

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const personalizedMessage = useMemo(() => {
    if (!student) return "";
    return buildPersonalizedSurveyMessage({ ...student, ...(form ?? {}) } as JourneyClient);
  }, [student, form]);

  function update(key: string, value: string) {
    setForm((current) => current ? { ...current, [key]: value } : current);
  }

  async function save() {
    if (!form) return;
    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);
      const response = await adminFetch(`/api/admin/students/${studentId}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { student?: JourneyClient; error?: string };
      if (!response.ok || !data.student) throw new Error(data.error ?? "Erro ao salvar aluno.");
      setStudent(data.student);
      setForm(studentToForm(data.student));
      setMessage("Aluno atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aluno.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
  }

  if (!form || !student) {
    return <section className="mx-auto max-w-6xl px-5 py-8"><p className="label-pill">Aluno</p><h1 className="mt-3 text-4xl font-black text-slate-950">Carregando ficha...</h1>{error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</p> : null}</section>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">Ficha do aluno</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{student.full_name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Atualizado em {formatDate(student.updated_at ?? student.created_at)}. Use esta ficha para guardar o que Diego já sabe e conduzir a próxima etapa sem recomeçar do zero.</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link className="btn-admin-secondary" href={buildAdminApiUrl("/admin/pesquisa-diego/alunos", token)}>Voltar</Link>
          <button className="btn-admin-primary" type="button" onClick={save} disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar ficha"}</button>
        </div>
      </div>

      {error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {message ? <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</p> : null}
      {copied ? <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-700">{copied} copiado.</p> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="space-y-6">
          <FormCard title="Dados básicos e status">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo" value={form.full_name} onChange={(value) => update("full_name", value)} />
              <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => update("whatsapp", value)} />
              <Field label="E-mail" value={form.email} onChange={(value) => update("email", value)} />
              <Field label="Faixa etária" value={form.age_range} onChange={(value) => update("age_range", value)} />
              <Field label="Cidade" value={form.city} onChange={(value) => update("city", value)} />
              <Field label="Bairro" value={form.neighborhood} onChange={(value) => update("neighborhood", value)} />
              <SelectField label="Tipo" value={form.client_type} onChange={(value) => update("client_type", value)} options={clientTypeLabels} />
              <SelectField label="Status" value={form.current_status} onChange={(value) => update("current_status", value)} options={clientStatusLabels} />
              <SelectField label="Prioridade" value={form.priority} onChange={(value) => update("priority", value)} options={priorityLabels} />
              <SelectField label="Pesquisa personalizada" value={form.personalized_survey_status} onChange={(value) => update("personalized_survey_status", value)} options={surveyStatusLabels} />
            </div>
          </FormCard>

          <FormCard title="Agenda e rotina">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Local de treino" value={form.training_location} onChange={(value) => update("training_location", value)} />
              <Field label="Frequência semanal" value={form.weekly_frequency} onChange={(value) => update("weekly_frequency", value)} />
              <Field label="Dias habituais" value={form.usual_days} onChange={(value) => update("usual_days", value)} />
              <Field label="Horário habitual" value={form.usual_time} onChange={(value) => update("usual_time", value)} />
              <Field label="Último contato" type="datetime-local" value={form.last_contact_at} onChange={(value) => update("last_contact_at", value)} />
              <Field label="Próximo contato" type="datetime-local" value={form.next_contact_at} onChange={(value) => update("next_contact_at", value)} />
            </div>
          </FormCard>

          <FormCard title="Histórico, objetivos e cuidados">
            <TextareaField label="Objetivo principal" value={form.main_goal} onChange={(value) => update("main_goal", value)} />
            <TextareaField label="Objetivos secundários" value={form.secondary_goals} onChange={(value) => update("secondary_goals", value)} />
            <TextareaField label="Limitações/cuidados conhecidos" value={form.known_limitations} onChange={(value) => update("known_limitations", value)} />
            <TextareaField label="Observações de saúde informadas pelo aluno" value={form.health_notes} onChange={(value) => update("health_notes", value)} />
            <TextareaField label="Histórico de treino" value={form.training_history} onChange={(value) => update("training_history", value)} />
          </FormCard>

          <FormCard title="Memória narrada e próxima etapa">
            <TextareaField label="Narrativa/memória do Diego" value={form.diego_memory_notes} onChange={(value) => update("diego_memory_notes", value)} rows={8} />
            <TextareaField label="Transcrição de áudio" value={form.audio_transcription} onChange={(value) => update("audio_transcription", value)} rows={8} />
            <TextareaField label="Resumo estruturado revisado" value={form.structured_summary} onChange={(value) => update("structured_summary", value)} rows={8} />
            <TextareaField label="Próxima etapa da Jornada" value={form.next_journey_step} onChange={(value) => update("next_journey_step", value)} rows={4} />
            <TextareaField label="Programa sugerido" value={form.suggested_program} onChange={(value) => update("suggested_program", value)} rows={3} />
            <TextareaField label="Oportunidades tecnológicas" value={form.tech_opportunities} onChange={(value) => update("tech_opportunities", value)} rows={5} />
            <TextareaField label="Observações internas" value={form.internal_notes} onChange={(value) => update("internal_notes", value)} rows={4} />
            <Field label="Link da pesquisa personalizada" value={form.personalized_survey_link} onChange={(value) => update("personalized_survey_link", value)} />
          </FormCard>
        </div>

        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="text-2xl font-black">Ações rápidas</h2>
            <div className="mt-4 grid gap-3">
              <button className="btn-admin-primary" type="button" onClick={() => copyText("Prompt para áudio", buildAudioMemoryPrompt({ full_name: form.full_name }))}>Copiar prompt para áudio</button>
              <button className="btn-admin-secondary" type="button" onClick={() => copyText("Mensagem de pesquisa", personalizedMessage)}>Copiar mensagem de pesquisa</button>
              {form.whatsapp ? <a className="btn-admin-secondary" href={`https://wa.me/${form.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Abrir WhatsApp</a> : null}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-black">Mensagem personalizada</h2>
            <textarea className="textarea mt-4 min-h-56" readOnly value={personalizedMessage} />
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-black">Como usar esta ficha</h2>
            <ol className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li><strong>1.</strong> Registre o que Diego já sabe antes de enviar nova pesquisa.</li>
              <li><strong>2.</strong> Use o prompt para transformar áudio em resumo estruturado.</li>
              <li><strong>3.</strong> Defina próxima etapa, programa e oportunidade tecnológica.</li>
              <li><strong>4.</strong> Envie pesquisa curta apenas para confirmar o momento atual.</li>
              <li><strong>5.</strong> Atualize próximo contato para entrar na agenda de foco.</li>
            </ol>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card p-5"><h2 className="text-2xl font-black">{title}</h2><div className="mt-4 space-y-4">{children}</div></div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-sm font-bold">{label}<input className="input mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Record<string, string> }) {
  return <label className="block text-sm font-bold">{label}<select className="select mt-2" value={value} onChange={(event) => onChange(event.target.value)}>{Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}

function TextareaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="block text-sm font-bold">{label}<textarea className="textarea mt-2" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function StudentFallback() {
  return <section className="mx-auto max-w-6xl px-5 py-8"><p className="label-pill">Aluno</p><h1 className="mt-3 text-4xl font-black text-slate-950">Carregando ficha...</h1></section>;
}

export default function StudentDetailPage() {
  return <main className="admin-shell"><Header /><Suspense fallback={<StudentFallback />}><AdminAuthGuard><StudentDetailContent /></AdminAuthGuard></Suspense></main>;
}
