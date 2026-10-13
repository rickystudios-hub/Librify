import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/components/AudioProvider";
import { Sidebar } from "@/components/Sidebar";
import { PlayerBar } from "@/components/PlayerBar";

export const metadata: Metadata = {
  title: "Librify — Web Player",
  description: "Clone open-source 1:1 do Spotify com paridade arquitetural de alta fidelidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AudioProvider>
          <div className="app-shell">
            <Sidebar />
            <main className="app-main">
              {children}
            </main>
            <PlayerBar />
          </div>
        </AudioProvider>
      </body>
    </html>
  );
}
