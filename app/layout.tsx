import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jornada Personal Extrema | Diego Montagnini",
  description:
    "Pesquisa, diagnóstico e jornada personalizada por Diego Montagnini.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
