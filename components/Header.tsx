"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [legacyToken, setLegacyToken] = useState("");
  const isAdmin = pathname.startsWith("/admin");
  const isPesquisa = pathname.startsWith("/pesquisa");
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setLegacyToken(typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") ?? "" : "");
    let active = true;

    async function loadSession() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (active) setIsLogged(Boolean(data.session));
      } catch {
        if (active) setIsLogged(false);
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  const navHref = useMemo(() => {
    const suffix = legacyToken ? `?token=${encodeURIComponent(legacyToken)}` : "";
    return {
      gestao: `/admin/pesquisa-diego${suffix}`,
      leads: `/admin/pesquisa-diego/leads${suffix}`,
      dashboard: `/admin/pesquisa-diego/dashboard${suffix}`,
      agenda: `/admin/pesquisa-diego/agenda${suffix}`,
    };
  }, [legacyToken]);

  async function logout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setIsLogged(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-header sticky top-0 z-40 mx-auto w-full px-4 py-3 sm:px-5">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-slate-950/92 px-3 py-3 shadow-2xl backdrop-blur sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="brand-logo-frame relative flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl sm:h-14 sm:w-14">
            <Image
              src="/logo-jpe.png"
              alt="Logo Jornada Personal Extrema"
              fill
              sizes="56px"
              className="object-contain p-1"
              priority
            />
          </span>

          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-black tracking-tight text-white sm:text-lg">
              Jornada Personal Extrema
            </span>
            <span className="block truncate text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">
              Diego Montagnini
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-200 sm:gap-3 sm:text-sm">
          {isAdmin ? (
            <>
              <Link href={navHref.gestao} className="hidden hover:text-emerald-300 sm:inline-flex">
                Gestão
              </Link>
              <Link href={navHref.leads} className="hidden hover:text-emerald-300 md:inline-flex">
                Leads
              </Link>
              <Link href={navHref.dashboard} className="hidden hover:text-emerald-300 md:inline-flex">
                Dashboard
              </Link>
              <Link href={navHref.agenda} className="hidden hover:text-emerald-300 lg:inline-flex">
                Agenda
              </Link>
              <button className="header-action" type="button" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <>
              {!isPesquisa ? (
                <Link href="/pesquisa" className="hover:text-emerald-300">
                  Pesquisa
                </Link>
              ) : (
                <Link href="/" className="hover:text-emerald-300">
                  Início
                </Link>
              )}
              {isLogged || legacyToken ? (
                <Link href={navHref.gestao} className="header-action">
                  Gestão
                </Link>
              ) : (
                <Link href="/login" className="header-action">
                  Entrar
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
