import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { audiences } from "@/lib/survey-config";

export default function PesquisaPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <p className="label-pill-gold">Diagnóstico inicial</p>
            <h1 className="brand-gradient-text mt-4 text-4xl font-black md:text-5xl">
              Escolha o público da pesquisa
            </h1>
            <p className="mt-4 max-w-3xl leading-8 text-slate-200">
              Cada trilha combina perguntas comuns com perguntas específicas.
              Todas as perguntas indicam se são de escolha única, múltipla escolha
              ou texto livre, com espaço para comentário opcional quando fizer sentido.
            </p>
          </div>

          <div className="card flex items-center gap-4 p-4">
            <div className="brand-logo-frame relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src="/logo-jpe.png"
                alt="Logo Jornada Personal Extrema"
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-sm font-black text-white">Jornada Personal Extrema</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Diego Montagnini
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <Link
              key={audience.slug}
              href={`/pesquisa/${audience.slug}`}
              className="card block p-5 transition hover:-translate-y-1 hover:border-emerald-300/40 hover:shadow-xl"
            >
              <p className="label-pill mb-4">Pesquisa segmentada</p>
              <h2 className="text-xl font-black text-white">{audience.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {audience.description}
              </p>
              <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm font-bold text-yellow-100">
                Oferta gratuita: {audience.freeOffer}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
