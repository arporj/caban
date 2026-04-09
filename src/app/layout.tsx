import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

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
    <html lang="pt-BR" className={manrope.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
