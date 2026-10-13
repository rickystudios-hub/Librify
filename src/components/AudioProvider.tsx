"use client";

import React, { useEffect } from "react";
import { audioController } from "@/lib/audioController";
import { youtubePlayer } from "@/lib/youtubePlayer";

/**
 * Componente mestre inserido no Root Layout (Persistent Shell)
 * Garante que o AudioController e o Headless YouTube Player permaneçam ativos
 * durante qualquer navegação ou troca de rotas.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    audioController.init();
    youtubePlayer.init("youtube-player-host");
  }, []);

  return (
    <>
      {children}
      {/* Container invisível e desacoplado para a engine do YouTube */}
      <div
        id="youtube-player-host"
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </>
  );
}
