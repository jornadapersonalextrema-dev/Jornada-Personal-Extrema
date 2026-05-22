import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <main>
      <Header />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-10 pt-4 md:grid-cols-[1.08fr_0.92fr] md:items-start">
        <div>
          <p className="label-pill-gold mb-5">
            Pesquisa + Diagnóstico + Consultoria gratuita
          </p>

          <h1 className="brand-gradient-text text-4xl font-black leading-tight md:text-6xl">
            Transforme pesquisa em conversa certa para cada público.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            A Jornada Personal Extrema, conduzida por <strong>Diego Montagnini</strong>,
            ajuda a entender dores reais, identificar perfis de alunos e gerar uma
            primeira mensagem persuasiva para WhatsApp com base no método Deep Dive.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/pesquisa">
              Responder diagnóstico
            </Link>
            <Link className="btn-secondary" href="/admin/pesquisa-diego">
              Gestão
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Consultoria inicial gratuita
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Treino personalizado por perfil
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Corpo, energia e rotina
            </div>
          </div>
        </div>

        <div className="card overflow-hidden p-4 md:mt-2 md:p-5">
          <div className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950">
            <Image
              src="/diego-montagnini.jpg"
              alt="Diego Montagnini"
              fill
              sizes="(min-width: 768px) 460px, 100vw"
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="label-pill mb-3">Diego Montagnini</p>
              <h2 className="text-3xl font-black text-white">
                Diagnóstico antes do treino.
              </h2>
              <p className="mt-3 leading-7 text-slate-200">
                Antes de prescrever, entender: rotina, dores, desejos, bloqueios e
                o tipo de apoio que cada pessoa realmente precisa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section-light">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-5">
          {[
            "Corredores",
            "Adultos 45+",
            "Rotina corrida",
            "Consciência corporal",
            "Parceiros",
          ].map((item) => (
            <div key={item} className="brand-card-light p-5 text-center">
              <p className="text-lg font-black">{item}</p>
              <p className="mt-2 text-sm text-slate-600">
                Pesquisa segmentada para descobrir dores e oportunidades reais.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
