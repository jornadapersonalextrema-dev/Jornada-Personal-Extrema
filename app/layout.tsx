import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jornada Personal Extrema",
  description: "Pesquisa, diagnóstico e jornada personalizada por Diego.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
