"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { adminFetch, buildAdminApiUrl } from "@/lib/client-admin";
import { buildNarrativeTemplate } from "@/lib/audio-memory-prompts";
import { clientStatusLabels, clientTypeLabels, priorityLabels, surveyStatusLabels } from "@/lib/student-journey";
import type { JourneyClient } from "@/lib/types";

type StudentsResponse = { students: JourneyClient[] };

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleDateString("pt-BR");
}

function StudentsContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [students, setStudents] = useState<JourneyClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("aluno_atual");
  const [csvText, setCsvText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);

  async function loadStudents() {
    try {
      setIsLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (statusFilter) query.set("status", statusFilter);
      if (typeFilter) query.set("type", typeFilter);
      const response = await adminFetch(`/api/admin/students?${query.toString()}`, token);
      const data = (await response.json()) as StudentsResponse | { error?: string };
      if (!response.ok) throw new Error("error" in data && data.error ? data.error : "Erro ao carregar alunos.");
      setStudents((data as StudentsResponse).students ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar alunos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((student) => student.current_status === "ativo").length;
    const risk = students.filter((student) => student.current_status === "risco_de_saida").length;
    const noSurvey = students.filter((student) => (student.personalized_survey_status ?? "nao_enviada") === "nao_enviada").length;
    return { total, active, risk, noSurvey };
  }, [students]);

  async function importCsv() {
    try {
      setImportMessage(null);
      setError(null);
      const response = await adminFetch("/api/admin/students/import", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = (await response.json()) as { imported?: number; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Erro ao importar CSV.");
      setImportMessage(`${data.imported ?? 0} aluno(s) importado(s) com sucesso.`);
      setCsvText("");
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar CSV.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-pill">Alunos atuais</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Cadastro e memória da Jornada</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Cadastre alunos atuais a partir de dados básicos, narrativa do Diego ou planilha CSV. O objetivo é transformar o que Diego já sabe em próxima etapa da Jornada, sem perguntar de novo o que já faz parte da relação.
          </p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link className="btn-admin-secondary" href={buildAdminApiUrl("/admin/pesquisa-diego", token)}>Painel</Link>
          <Link className="btn-admin-secondary" href={buildAdminApiUrl("/admin/pesquisa-diego/agenda", token)}>Agenda</Link>
          <Link className="btn-admin-primary" href={buildAdminApiUrl("/admin/pesquisa-diego/alunos/novo", token)}>Cadastrar aluno</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Alunos filtrados" value={stats.total} />
        <MetricCard label="Ativos" value={stats.active} />
        <MetricCard label="Risco de saída" value={stats.risk} />
        <MetricCard label="Pesquisa não enviada" value={stats.noSurvey} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="card p-5">
          <h2 className="text-2xl font-black">Filtros</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="text-sm font-bold md:col-span-2">
              Buscar
              <input className="input mt-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, WhatsApp ou e-mail" />
            </label>
            <label className="text-sm font-bold">
              Tipo
              <select className="select mt-2" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="todos">Todos</option>
                {Object.entries(clientTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">
              Status
              <select className="select mt-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="todos">Todos</option>
                {Object.entries(clientStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>
          <button className="btn-admin-secondary mt-4" type="button" onClick={loadStudents}>Aplicar busca</button>
        </div>

        <details className="card p-5">
          <summary className="cursor-pointer text-2xl font-black">Importar planilha CSV</summary>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Exporte a planilha como CSV e cole aqui. Cabeçalhos aceitos: nome, whatsapp, email, bairro, cidade, objetivo_principal, frequencia_semanal, dias_habituais, horario_habitual, local_treino, narrativa, limitacoes, observacoes_saude.
          </p>
          <textarea className="textarea mt-4 min-h-36" value={csvText} onChange={(event) => setCsvText(event.target.value)} placeholder={'nome,whatsapp,email,objetivo_principal,narrativa\nMaria,19999999999,maria@email.com,Força,"Treina há 2 anos..."'} />
          <button className="btn-admin-primary mt-4 w-full" type="button" onClick={importCsv}>Importar CSV</button>
          {importMessage ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{importMessage}</p> : null}
        </details>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-5">
          <h2 className="text-2xl font-black">Como Diego deve narrar</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-700">{buildNarrativeTemplate()}</pre>
        </div>

        <div className="card p-5">
          <h2 className="text-2xl font-black">Lista de alunos</h2>
          {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
          {isLoading ? <p className="mt-4 text-slate-600">Carregando alunos...</p> : null}
          {!isLoading && students.length === 0 ? <p className="mt-4 text-slate-600">Nenhum aluno encontrado ainda.</p> : null}
          <div className="mt-4 grid gap-3">
            {students.map((student) => (
              <Link key={student.id} href={buildAdminApiUrl(`/admin/pesquisa-diego/alunos/${student.id}`, token)} className="block rounded-2xl bg-slate-100 p-4 hover:bg-slate-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-black text-slate-950">{student.full_name}</p>
                    <p className="text-sm text-slate-600">{student.whatsapp || "Sem WhatsApp"} • {student.training_location || "Local não informado"}</p>
                    <p className="mt-2 text-sm text-slate-700"><strong>Objetivo:</strong> {student.main_goal || "Não informado"}</p>
                    <p className="text-sm text-slate-700"><strong>Próxima etapa:</strong> {student.next_journey_step || "Definir próxima etapa"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-black">
                    <span className="label-pill">{clientStatusLabels[student.current_status ?? "ativo"] ?? student.current_status}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700">{priorityLabels[student.priority ?? "media"] ?? student.priority}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700">{surveyStatusLabels[student.personalized_survey_status ?? "nao_enviada"]}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Atualizado em {formatDate(student.updated_at ?? student.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function StudentsFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="label-pill">Alunos atuais</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Cadastro e memória da Jornada</h1>
      <p className="mt-8 text-slate-600">Carregando alunos...</p>
    </section>
  );
}

export default function StudentsPage() {
  return (
    <main className="admin-shell">
      <Header />
      <Suspense fallback={<StudentsFallback />}>
        <AdminAuthGuard>
          <StudentsContent />
        </AdminAuthGuard>
      </Suspense>
    </main>
  );
}
