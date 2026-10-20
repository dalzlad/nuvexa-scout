import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "NUVEXA Scout | Simulador", description: "Panel local de supervisión y control simulado de un robot móvil." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
