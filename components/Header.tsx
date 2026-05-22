import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
      <Link href="/" className="font-black tracking-tight text-stone-950">
        Jornada Personal Extrema
        <span className="ml-2 text-sm font-semibold text-stone-500">por Diego</span>
      </Link>
      <nav className="flex gap-3 text-sm font-semibold text-stone-700">
        <Link href="/pesquisa">Pesquisa</Link>
      </nav>
    </header>
  );
}
