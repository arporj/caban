import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CABAN — Controle de Finanças Pessoais",
  description: "Gerencie suas finanças pessoais com uma experiência premium. Controle contas, cartões de crédito, categorias e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
