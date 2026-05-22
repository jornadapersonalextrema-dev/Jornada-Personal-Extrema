"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") || "/admin/pesquisa-diego";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/login?returnTo=${encodeURIComponent(returnTo)}`;
  }, [returnTo]);

  useEffect(() => {
    let active = true;

    async function hydrateSession() {
      const supabase = createBrowserSupabaseClient();
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      }

      const { data } = await supabase.auth.getSession();
      if (active && data.session) {
        router.replace(returnTo);
      }
    }

    hydrateSession();

    return () => {
      active = false;
    };
  }, [returnTo, router]);

  async function sendMagicLink() {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) throw signInError;

      setMessage("Enviamos um link de acesso para o e-mail informado. Abra o e-mail neste navegador para entrar na Gestão.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o link de acesso.");
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithPassword() {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) throw signInError;

      router.replace(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar com e-mail e senha.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="card p-6">
        <p className="label-pill">Área restrita</p>
        <h1 className="mt-4 text-4xl font-black text-white lg:text-5xl">
          Entre na Gestão da Jornada Personal Extrema.
        </h1>
        <p className="mt-4 leading-7 text-slate-200">
          Use o e-mail autorizado no Supabase para acessar leads, dashboard, follow-ups, agenda e próximos passos de cada aluno ou potencial cliente.
        </p>
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50">
          <strong>Recomendação:</strong> para o MVP, cadastre o Diego Montagnini como usuário autorizado no Supabase Auth. Depois, se houver equipe, adicione os e-mails permitidos na variável ADMIN_ALLOWED_EMAILS.
        </div>
      </div>

      <div className="brand-card-light p-6">
        <h2 className="text-2xl font-black text-slate-950">Acesso por e-mail</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Você pode entrar por link mágico enviado ao e-mail ou por senha, caso o usuário já tenha senha cadastrada no Supabase.
        </p>

        <div className="mt-5 grid gap-4">
          <label className="block text-sm font-bold text-slate-800">
            E-mail
            <input className="input mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="diego@email.com" required />
          </label>

          <label className="block text-sm font-bold text-slate-800">
            Senha opcional
            <input className="input mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Use apenas se tiver senha cadastrada" />
          </label>

          {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button className="btn-admin-primary" type="button" onClick={sendMagicLink} disabled={!email || isLoading}>
              Enviar link por e-mail
            </button>
            <button className="btn-admin-secondary" type="button" onClick={signInWithPassword} disabled={!email || !password || isLoading}>
              Entrar com senha
            </button>
          </div>

          <Link className="text-sm font-bold text-emerald-700 hover:text-emerald-900" href="/">
            Voltar para o início
          </Link>
        </div>
      </div>
    </section>
  );
}

function LoginFallback() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-8">
      <div className="card p-6">
        <p className="text-sm font-bold text-slate-200">Carregando acesso...</p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={<LoginFallback />}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
