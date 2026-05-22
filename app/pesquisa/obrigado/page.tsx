import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function ObrigadoPage() {
  return (
    <main>
      <Header />

      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="card overflow-hidden p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
            <div className="relative min-h-56 overflow-hidden rounded-[26px] border border-white/10 bg-slate-950">
              <Image
                src="/diego-montagnini.jpg"
                alt="Diego Montagnini"
                fill
                sizes="190px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />
            </div>

            <div>
              <p className="label-pill">Respostas enviadas</p>

              <h1 className="brand-gradient-text mt-4 text-4xl font-black">
                Obrigado por responder.
              </h1>

              <p className="mt-4 leading-7 text-slate-200">
                Suas respostas ajudam o <strong>Diego Montagnini</strong> a entender
                melhor sua rotina, seus objetivos e os desafios que impedem uma
                evolução mais consistente.
              </p>

              <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
                Importante: este diagnóstico não substitui avaliação médica,
                fisioterapêutica, psicológica ou nutricional. A proposta é orientar
                uma conversa inicial sobre movimento, rotina, treino e qualidade de vida.
              </p>

              <Link className="btn-primary mt-6" href="/">
                Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
