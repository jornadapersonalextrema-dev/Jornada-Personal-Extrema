"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  getAudience,
  getQuestionsForAudience,
  questionTypeLabel,
} from "@/lib/survey-config";
import type { SurveyPayload } from "@/lib/types";

export default function PesquisaPublicoPage() {
  const params = useParams<{ publico: string }>();
  const router = useRouter();

  const publico = params.publico;
  const audience = getAudience(publico);
  const questions = useMemo(() => getQuestionsForAudience(publico), [publico]);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [city, setCity] = useState("");
  const [source, setSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!audience) {
    return (
      <main>
        <Header />
        <div className="mx-auto max-w-3xl px-5 py-12">
          <h1 className="text-2xl font-black">Público não encontrado.</h1>
          <p className="mt-3 text-stone-700">
            Volte para a página da pesquisa e escolha um dos públicos disponíveis.
          </p>
        </div>
      </main>
    );
  }

  const audienceSlug = audience.slug;

  function setSingle(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function toggleMultiple(key: string, value: string) {
    setAnswers((current) => {
      const currentValues = Array.isArray(current[key])
        ? (current[key] as string[])
        : [];

      const next = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...current, [key]: next };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: SurveyPayload = {
      audienceSlug,
      name,
      whatsapp,
      email,
      ageRange,
      city,
      source,
      answers,
      comments,
    };

    const response = await fetch("/api/survey/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      setError(data.error ?? "Não foi possível salvar as respostas.");
      setIsSubmitting(false);
      return;
    }

    router.push("/pesquisa/obrigado");
  }

  return (
    <main>
      <Header />

      <section className="mx-auto max-w-4xl px-5 py-8">
        <p className="label-pill">{audience.name}</p>

        <h1 className="mt-4 text-4xl font-black text-stone-950">
          Diagnóstico Corpo, Energia e Rotina
        </h1>

        <p className="mt-3 text-stone-700">
          Oferta gratuita indicada para este público:{" "}
          <strong>{audience.freeOffer}</strong>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="card grid gap-4 p-5 md:grid-cols-2">
            <label className="block text-sm font-bold">
              Nome *
              <input
                className="input mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-bold">
              WhatsApp *
              <input
                className="input mt-2"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-bold">
              E-mail
              <input
                className="input mt-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block text-sm font-bold">
              Faixa etária
              <select
                className="select mt-2"
                value={ageRange}
                onChange={(event) => setAgeRange(event.target.value)}
              >
                <option value="">Selecione</option>
                <option>Até 25</option>
                <option>26 a 35</option>
                <option>36 a 45</option>
                <option>46 a 55</option>
                <option>56 a 65</option>
                <option>66+</option>
              </select>
            </label>

            <label className="block text-sm font-bold">
              Cidade/bairro
              <input
                className="input mt-2"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </label>

            <label className="block text-sm font-bold">
              Como chegou até aqui?
              <input
                className="input mt-2"
                value={source}
                onChange={(event) => setSource(event.target.value)}
              />
            </label>
          </div>

          {questions.map((question, index) => (
            <div key={question.key} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-pill">Pergunta {index + 1}</span>
                <span className="label-pill">
                  {questionTypeLabel(question.type)}
                </span>
                {question.required ? (
                  <span className="label-pill">Obrigatória</span>
                ) : (
                  <span className="label-pill">Opcional</span>
                )}
                {question.allowComment ? (
                  <span className="label-pill">Comentário opcional</span>
                ) : null}
              </div>

              <h2 className="mt-3 text-xl font-black text-stone-950">
                {question.title}
              </h2>

              {question.description ? (
                <p className="mt-1 text-sm text-stone-600">
                  {question.description}
                </p>
              ) : null}

              {question.type === "free_text" ? (
                <textarea
                  className="textarea mt-4 min-h-28"
                  value={(answers[question.key] as string) ?? ""}
                  onChange={(event) =>
                    setSingle(question.key, event.target.value)
                  }
                  required={question.required}
                />
              ) : null}

              {question.type === "single_choice" ? (
                <div className="mt-4 grid gap-2">
                  {question.options?.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer gap-3 rounded-2xl border border-stone-200 bg-white p-3 text-sm font-semibold text-stone-700"
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={option.value}
                        checked={answers[question.key] === option.value}
                        onChange={() => setSingle(question.key, option.value)}
                        required={question.required}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              ) : null}

              {question.type === "multiple_choice" ? (
                <div className="mt-4 grid gap-2">
                  {question.options?.map((option) => {
                    const selected =
                      Array.isArray(answers[question.key]) &&
                      (answers[question.key] as string[]).includes(option.value);

                    return (
                      <label
                        key={option.value}
                        className="flex cursor-pointer gap-3 rounded-2xl border border-stone-200 bg-white p-3 text-sm font-semibold text-stone-700"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleMultiple(question.key, option.value)
                          }
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {question.allowComment ? (
                <textarea
                  className="textarea mt-4 min-h-20"
                  placeholder="Comentário opcional"
                  value={comments[question.key] ?? ""}
                  onChange={(event) =>
                    setComments((current) => ({
                      ...current,
                      [question.key]: event.target.value,
                    }))
                  }
                />
              ) : null}
            </div>
          ))}

          {error ? (
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="btn-primary w-full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar diagnóstico"}
          </button>
        </form>
      </section>
    </main>
  );
}