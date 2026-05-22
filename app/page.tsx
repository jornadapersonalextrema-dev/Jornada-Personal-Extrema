import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white">
            Pesquisa + Diagnóstico + Mensagem para WhatsApp
          </p>
          <h1 className="text-4xl font-black leading-tight text-stone-950 md:text-6xl">
            Antes de montar um treino, entenda a rotina, a dor e o desejo real.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            A Jornada Personal Extrema ajuda o Diego a pesquisar diferentes públicos, identificar dores reais, sugerir ofertas gratuitas e gerar uma primeira mensagem persuasiva baseada em Deep Dive.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/pesquisa">Responder diagnóstico</Link>
            <Link className="btn-secondary" href="/admin/pesquisa-diego">Painel admin</Link>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-black">O que o MVP faz</h2>
          <ul className="mt-5 space-y-3 text-stone-700">
            <li>• Pesquisa por público: corredores, 45+, rotina corrida, consciência corporal e parceiros.</li>
            <li>• Perguntas com escolha única, múltipla escolha e comentários opcionais.</li>
            <li>• Classificação automática do perfil e da oferta gratuita.</li>
            <li>• Geração de texto para copiar e enviar pelo WhatsApp.</li>
            <li>• Painel com total de respostas, dores, objetivos, leads e CSV.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
