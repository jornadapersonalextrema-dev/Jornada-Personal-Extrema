"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { adminFetch, buildAdminApiUrl } from "@/lib/client-admin";
import { buildAudioMemoryPrompt, buildNarrativeTemplate } from "@/lib/audio-memory-prompts";
import { clientStatusLabels, clientTypeLabels, priorityLabels, surveyStatusLabels } from "@/lib/student-journey";

type FormState = Record<string, string>;

const initialState: FormState = {
  full_name: "",
  whatsapp: "",
  email: "",
  age_range: "",
  city: "",
  neighborhood: "",
  current_status: "ativo",
  client_type: "aluno_atual",
  training_location: "",
  weekly_frequency: "",
  usual_days: "",
  usual_time: "",
  main_goal: "",
  secondary_goals: "",
  known_limitations: "",
  health_notes: "",
  training_history: "",
  diego_memory_notes: "",
  audio_transcription: "",
  structured_summary: "",
  next_journey_step: "",
  suggested_program: "",
  tech_opportunities: "",
  personalized_survey_status: "nao_enviada",
  personalized_survey_link: "",
  priority: "media",
  internal_notes: "",
  next_contact_at: "",
};

function NewStudentContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    try {
      setIsSaving(true);
      setError(null);
      const response = await adminFetch("/api/admin/students", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { student?: { id: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar aluno.");
      router.push(buildAdminApiUrl(`/admin/pesquisa-diego/alunos/${data.student?.id}`, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aluno.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyPrompt() {
    const prompt = buildAudioMemoryPrompt({ full_name: form.full_name || "[nome do aluno]" });
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">Novo aluno</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Cadastrar a partir da memória do Diego</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Preencha o básico, cole a narrativa/transcrição e deixe o sistema sugerir programa, próxima etapa e oportunidades tecnológicas.
          </p>
        </div>
        <Link className="btn-admin-secondary" href={buildAdminApiUrl("/admin/pesquisa-diego/alunos", token)}>Voltar para alunos</Link>
      </div>

      {error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <FormCard title="1. Dados básicos">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo *" value={form.full_name} onChange={(value) => update("full_name", value)} />
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

          <FormCard title="2. Agenda e rotina de treino">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Local de treino" value={form.training_location} onChange={(value) => update("training_location", value)} />
              <Field label="Frequência semanal" value={form.weekly_frequency} onChange={(value) => update("weekly_frequency", value)} />
              <Field label="Dias habituais" value={form.usual_days} onChange={(value) => update("usual_days", value)} />
              <Field label="Horário habitual" value={form.usual_time} onChange={(value) => update("usual_time", value)} />
              <Field label="Próximo contato" type="datetime-local" value={form.next_contact_at} onChange={(value) => update("next_contact_at", value)} />
              <Field label="Link da pesquisa personalizada" value={form.personalized_survey_link} onChange={(value) => update("personalized_survey_link", value)} />
            </div>
          </FormCard>

          <FormCard title="3. Objetivos, cuidados e histórico">
            <TextareaField label="Objetivo principal" value={form.main_goal} onChange={(value) => update("main_goal", value)} />
            <TextareaField label="Objetivos secundários" value={form.secondary_goals} onChange={(value) => update("secondary_goals", value)} />
            <TextareaField label="Limitações/cuidados conhecidos" value={form.known_limitations} onChange={(value) => update("known_limitations", value)} />
            <TextareaField label="Observações de saúde informadas pelo aluno" value={form.health_notes} onChange={(value) => update("health_notes", value)} />
            <TextareaField label="Histórico de treino" value={form.training_history} onChange={(value) => update("training_history", value)} />
          </FormCard>

          <FormCard title="4. Memória narrada e estruturação">
            <TextareaField label="Narrativa/memória do Diego" value={form.diego_memory_notes} onChange={(value) => update("diego_memory_notes", value)} rows={8} />
            <TextareaField label="Transcrição de áudio" value={form.audio_transcription} onChange={(value) => update("audio_transcription", value)} rows={8} />
            <TextareaField label="Resumo estruturado revisado" value={form.structured_summary} onChange={(value) => update("structured_summary", value)} rows={8} />
            <TextareaField label="Próxima etapa sugerida" value={form.next_journey_step} onChange={(value) => update("next_journey_step", value)} rows={4} />
            <TextareaField label="Programa sugerido" value={form.suggested_program} onChange={(value) => update("suggested_program", value)} rows={3} />
            <TextareaField label="Oportunidades tecnológicas" value={form.tech_opportunities} onChange={(value) => update("tech_opportunities", value)} rows={5} />
            <TextareaField label="Observações internas" value={form.internal_notes} onChange={(value) => update("internal_notes", value)} rows={4} />
          </FormCard>

          <button className="btn-admin-primary w-full" type="button" onClick={save} disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar aluno"}</button>
        </div>

        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="text-2xl font-black">Prompt para áudio</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Copie o prompt, cole no ChatGPT junto com a transcrição da fala do Diego e depois traga o resumo para esta ficha.</p>
            <button className="btn-admin-primary mt-4 w-full" type="button" onClick={copyPrompt}>{copiedPrompt ? "Prompt copiado" : "Copiar prompt"}</button>
          </div>
          <div className="card p-5">
            <h2 className="text-2xl font-black">Modelo de narrativa</h2>
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-700">{buildNarrativeTemplate()}</pre>
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

function NewStudentFallback() {
  return <section className="mx-auto max-w-6xl px-5 py-8"><p className="label-pill">Novo aluno</p><h1 className="mt-3 text-4xl font-black text-slate-950">Cadastrar aluno</h1><p className="mt-8 text-slate-600">Carregando...</p></section>;
}

export default function NewStudentPage() {
  return <main className="admin-shell"><Header /><Suspense fallback={<NewStudentFallback />}><AdminAuthGuard><NewStudentContent /></AdminAuthGuard></Suspense></main>;
}
