"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos. Confirme se o usuário foi criado no Supabase Auth, se a senha está correta e se o e-mail está confirmado.";
  }

  if (normalized.includes("email not confirmed") || normalized.includes("not confirmed")) {
    return "Este e-mail ainda não está confirmado no Supabase. Confirme o usuário em Authentication > Users ou desative a confirmação obrigatória para este MVP.";
  }

  if (normalized.includes("fetch failed") || normalized.includes("failed to fetch")) {
    return "Não foi possível conectar ao Supabase. Confira as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel e no .env.local.";
  }

  return message;
}

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
      const rawMessage = err instanceof Error ? err.message : "Não foi possível enviar o link de acesso.";
      setError(friendlyAuthError(rawMessage));
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
      router.refresh();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Não foi possível entrar com e-mail e senha.";
      setError(friendlyAuthError(rawMessage));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl items-start justify-center px-5 py-8 sm:items-center sm:py-10">
      <div className="brand-card-light w-full max-w-md p-6 sm:p-7">
        <div className="flex justify-center">
          <span className="brand-logo-frame relative flex h-20 w-20 overflow-hidden rounded-[24px]">
            <Image
              src="/logo-jpe.png"
              alt="Logo Jornada Personal Extrema"
              fill
              sizes="80px"
              className="object-contain p-2"
              priority
            />
          </span>
        </div>

        <p className="mt-5 text-center text-xs font-black uppercase tracking-[0.28em] text-emerald-700">
          Gestão
        </p>
        <h1 className="mt-2 text-center text-3xl font-black leading-tight text-slate-950">
          Acesso administrativo
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          Faça o login e acesse leads, dashboard, follow-ups, agenda e próximos passos de cada aluno ou potencial cliente.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="block text-sm font-bold text-slate-800">
            E-mail
            <input
              className="input mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jornadapersonalextrema@gmail.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm font-bold text-slate-800">
            Senha
            <input
              className="input mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite a senha cadastrada"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</p> : null}

          <button className="btn-admin-primary w-full" type="button" onClick={signInWithPassword} disabled={!email || !password || isLoading}>
            {isLoading ? "Entrando..." : "Entrar na Gestão"}
          </button>

          <button className="btn-admin-secondary w-full" type="button" onClick={sendMagicLink} disabled={!email || isLoading}>
            Enviar link mágico por e-mail
          </button>

          <div className="grid gap-2 text-center text-sm font-bold">
            <Link className="text-emerald-700 hover:text-emerald-900" href="/pesquisa">
              Ir para pesquisa
            </Link>
            <Link className="text-slate-500 hover:text-slate-800" href="/">
              Voltar para a página pública
            </Link>
          </div>
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
