import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 py-5">
      <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-slate-950/86 px-4 py-3 shadow-2xl backdrop-blur">
        <Link href="/" className="flex items-center gap-3">
          <span className="brand-logo-frame relative flex h-14 w-14 overflow-hidden rounded-2xl">
            <Image
              src="/logo-jpe.png"
              alt="Logo Jornada Personal Extrema"
              fill
              sizes="56px"
              className="object-contain p-1"
              priority
            />
          </span>

          <span className="leading-tight">
            <span className="block text-base font-black tracking-tight text-white md:text-lg">
              Jornada Personal Extrema
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Diego Montagnini
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-bold text-slate-200">
          <Link href="/pesquisa" className="hover:text-emerald-300">
            Pesquisa
          </Link>
        </nav>
      </div>
    </header>
  );
}
