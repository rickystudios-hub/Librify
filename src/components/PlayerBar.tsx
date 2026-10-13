"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useAudioController } from "@/hooks/useAudioController";
import { formatTime } from "@/lib/formatTime";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  X,
  Trash2,
} from "lucide-react";

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    userQueue,
    contextQueue,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    removeFromQueue,
    clearQueue,
    onSeekStart,
    onSeekMove,
    onSeekEnd,
  } = useAudioController();

  const [isLiked, setIsLiked] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);

  // Controle de arrasto da Seek Bar
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const seekTrackRef = useRef<HTMLDivElement>(null);

  // Controle de arrasto do Volume
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const volumeTrackRef = useRef<HTMLDivElement>(null);

  const activeTime = isDraggingSeek ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (activeTime / duration) * 100)) : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  // Handler de Seek
  const calculateSeekTime = useCallback((clientX: number) => {
    if (!seekTrackRef.current || duration <= 0) return 0;
    const rect = seekTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSeek(true);
    onSeekStart();
    const newTime = calculateSeekTime(e.clientX);
    setDragTime(newTime);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSeek) {
        const newTime = calculateSeekTime(e.clientX);
        setDragTime(newTime);
        onSeekMove(newTime);
      }
      if (isDraggingVolume && volumeTrackRef.current) {
        const rect = volumeTrackRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(ratio);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingSeek) {
        const finalTime = calculateSeekTime(e.clientX);
        setIsDraggingSeek(false);
        onSeekEnd(finalTime);
      }
      if (isDraggingVolume) {
        setIsDraggingVolume(false);
      }
    };

    if (isDraggingSeek || isDraggingVolume) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSeek, isDraggingVolume, calculateSeekTime, onSeekMove, onSeekEnd, setVolume]);

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    setIsDraggingVolume(true);
    if (volumeTrackRef.current) {
      const rect = volumeTrackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(ratio);
    }
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={18} />;
    if (volume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  return (
    <>
      <footer className="app-player">
        {/* Esquerda: Detalhes da Faixa Atual */}
        <div className="player-left">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.album.cover_url}
                alt={currentTrack.title}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 4,
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-base)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 160,
                  }}
                >
                  {currentTrack.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-subdued)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 160,
                  }}
                >
                  {currentTrack.artists.map((a) => a.name).join(", ")}
                </span>
              </div>
              <button
                className="control-btn"
                onClick={() => setIsLiked(!isLiked)}
                style={{ color: isLiked ? "var(--spotify-green)" : "var(--text-subdued)" }}
                title="Salvar na sua Biblioteca"
              >
                <Heart size={16} fill={isLiked ? "var(--spotify-green)" : "none"} />
              </button>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-subdued)" }}>
              Nenhuma faixa selecionada
            </div>
          )}
        </div>

        {/* Centro: Controles de Playback & Seek Bar */}
        <div className="player-center">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Botão Shuffle */}
            <button
              className={`control-btn ${isShuffle ? "active" : ""}`}
              onClick={toggleShuffle}
              title={isShuffle ? "Desativar ordem aleatória" : "Ativar ordem aleatória"}
            >
              <Shuffle size={16} />
            </button>

            {/* Botão Anterior */}
            <button
              className="control-btn"
              onClick={previousTrack}
              title="Anterior"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            {/* Botão Play / Pause */}
            <button
              className="play-pause-btn"
              onClick={togglePlay}
              title={isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>

            {/* Botão Próximo */}
            <button
              className="control-btn"
              onClick={nextTrack}
              title="Próxima"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>

            {/* Botão Repetir */}
            <button
              className={`control-btn ${repeatMode !== "off" ? "active" : ""}`}
              onClick={() => setRepeatMode()}
              title={`Repetir: ${repeatMode}`}
            >
              {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Seek Bar (Barra de Progresso Arrastável) */}
          <div className="seek-bar-container">
            <span className="time-label">{formatTime(activeTime)}</span>

            <div
              className="slider-track"
              ref={seekTrackRef}
              onMouseDown={handleSeekMouseDown}
            >
              <div
                className="slider-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="slider-thumb"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <span className="time-label">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Direita: Controles Extras, Fila e Volume */}
        <div className="player-right">
          {/* Botão Fila */}
          <button
            className={`control-btn ${showQueueModal ? "active" : ""}`}
            onClick={() => setShowQueueModal(!showQueueModal)}
            title="Fila de Reprodução"
          >
            <ListMusic size={18} />
          </button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: 130 }}>
            <button
              className="control-btn"
              onClick={toggleMute}
              title={isMuted ? "Desmutar" : "Mutar"}
            >
              {renderVolumeIcon()}
            </button>

            <div
              className="slider-track"
              ref={volumeTrackRef}
              onMouseDown={handleVolumeMouseDown}
              style={{ flex: 1 }}
            >
              <div
                className="slider-fill"
                style={{ width: `${volumePercent}%` }}
              />
              <div
                className="slider-thumb"
                style={{ left: `${volumePercent}%` }}
              />
            </div>
          </div>

          <button className="control-btn" title="Tela cheia">
            <Maximize2 size={16} />
          </button>
        </div>
      </footer>

      {/* Modal / Gaveta de Fila de Reprodução (Queue Drawer) */}
      {showQueueModal && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: "var(--player-height)",
            width: 360,
            maxHeight: "70vh",
            backgroundColor: "var(--bg-surface)",
            borderRadius: 8,
            boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Fila de Reprodução</h3>
            <button
              className="control-btn"
              onClick={() => setShowQueueModal(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
            {/* Faixa em Reprodução */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, color: "var(--text-subdued)", marginBottom: 8, textTransform: "uppercase" }}>
                Tocando Agora
              </h4>
              {currentTrack ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, backgroundColor: "var(--bg-elevated)", borderRadius: 6 }}>
                  <img
                    src={currentTrack.album.cover_url}
                    alt={currentTrack.title}
                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }}
                  />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--spotify-green)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {currentTrack.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-subdued)" }}>
                      {currentTrack.artists.map((a) => a.name).join(", ")}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma</p>
              )}
            </div>

            {/* Fila do Usuário (Prioritária) */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h4 style={{ fontSize: 13, color: "var(--text-subdued)", textTransform: "uppercase" }}>
                  Adicionadas à Fila ({userQueue.length})
                </h4>
                {userQueue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    style={{ background: "none", border: "none", color: "var(--text-subdued)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={12} /> Limpar
                  </button>
                )}
              </div>

              {userQueue.length > 0 ? (
                userQueue.map((t, idx) => (
                  <div
                    key={`${t.id}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: 4,
                      marginBottom: 4,
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                      <img src={t.album.cover_url} alt="" style={{ width: 32, height: 32, borderRadius: 3, objectFit: "cover" }} />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-subdued)" }}>
                          {t.artists[0]?.name}
                        </div>
                      </div>
                    </div>
                    <button
                      className="control-btn"
                      onClick={() => removeFromQueue(idx)}
                      title="Remover da fila"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Nenhuma faixa adicionada manualmente.
                </p>
              )}
            </div>

            {/* Próximas da Playlist/Álbum */}
            <div>
              <h4 style={{ fontSize: 13, color: "var(--text-subdued)", marginBottom: 8, textTransform: "uppercase" }}>
                A Seguir na Playlist ({contextQueue.length})
              </h4>
              {contextQueue.slice(0, 10).map((t, idx) => (
                <div
                  key={`ctx-${t.id}-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 4,
                    marginBottom: 4,
                    opacity: t.id === currentTrack?.id ? 0.4 : 1,
                  }}
                >
                  <img src={t.album.cover_url} alt="" style={{ width: 32, height: 32, borderRadius: 3, objectFit: "cover" }} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-subdued)" }}>
                      {t.artists[0]?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
