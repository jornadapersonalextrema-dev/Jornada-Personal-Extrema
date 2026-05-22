import Link from "next/link";
import { Header } from "@/components/Header";
import { audiences } from "@/lib/survey-config";

export default function PesquisaPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8">
          <p className="label-pill">Diagnóstico inicial</p>
          <h1 className="mt-4 text-4xl font-black text-stone-950">Escolha o público da pesquisa</h1>
          <p className="mt-3 max-w-3xl text-stone-700">
            Cada trilha combina perguntas comuns com perguntas específicas. Todas as perguntas indicam se são de escolha única, múltipla escolha ou texto livre.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <Link key={audience.slug} href={`/pesquisa/${audience.slug}`} className="card block p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-xl font-black text-stone-950">{audience.name}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-700">{audience.description}</p>
              <p className="mt-4 rounded-2xl bg-stone-100 p-3 text-sm font-semibold text-stone-700">Oferta gratuita: {audience.freeOffer}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
