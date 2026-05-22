"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type AuthState = "loading" | "authenticated" | "legacy-token" | "unauthenticated";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const legacyToken = searchParams.get("token") ?? "";
  const [state, setState] = useState<AuthState>(legacyToken ? "legacy-token" : "loading");

  const returnTo = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    let active = true;

    if (legacyToken) {
      setState("legacy-token");
      return;
    }

    async function checkSession() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();

        if (!active) return;
        setState(data.session ? "authenticated" : "unauthenticated");
      } catch {
        if (active) setState("unauthenticated");
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [legacyToken]);

  if (state === "loading") {
    return (
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="card p-6">
          <p className="text-sm font-bold text-slate-600">Verificando acesso...</p>
        </div>
      </section>
    );
  }

  if (state === "unauthenticated") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className="card p-6">
          <p className="label-pill">Área restrita</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Entre para acessar a gestão</h1>
          <p className="mt-3 leading-7 text-slate-600">
            A gestão da Jornada Personal Extrema é exclusiva do Diego/equipe. Entre com o e-mail cadastrado no Supabase Auth para visualizar leads, dashboard, agenda e próximos passos.
          </p>
          <Link className="btn-admin-primary mt-5" href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            Entrar na Gestão
          </Link>
        </div>
      </section>
    );
  }

  return children;
}
