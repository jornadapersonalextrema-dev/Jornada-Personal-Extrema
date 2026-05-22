import Link from "next/link";
import { Header } from "@/components/Header";

export default function ObrigadoPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="card p-8 text-center">
          <p className="label-pill mx-auto">Respostas enviadas</p>
          <h1 className="mt-4 text-4xl font-black text-stone-950">Obrigado por responder.</h1>
          <p className="mt-4 leading-7 text-stone-700">
            Suas respostas ajudam o Diego a entender melhor sua rotina, seus objetivos e os desafios que impedem uma evolução mais consistente.
          </p>
          <p className="mt-4 rounded-2xl bg-stone-100 p-4 text-sm text-stone-700">
            Importante: este diagnóstico não substitui avaliação médica, fisioterapêutica, psicológica ou nutricional. A proposta é orientar uma conversa inicial sobre movimento, rotina, treino e qualidade de vida.
          </p>
          <Link className="btn-primary mt-6" href="/">Voltar para o início</Link>
        </div>
      </section>
    </main>
  );
}
