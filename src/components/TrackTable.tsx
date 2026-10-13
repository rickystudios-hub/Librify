"use client";

import React, { useState } from "react";
import { Track } from "@/types/music";
import { usePlayerStore } from "@/store/usePlayerStore";
import { formatTime } from "@/lib/formatTime";
import { Play, Pause, Clock, Plus, Heart, MoreHorizontal, Check } from "lucide-react";

interface TrackTableProps {
  tracks: Track[];
  showAlbumColumn?: boolean;
}

export function TrackTable({ tracks, showAlbumColumn = true }: TrackTableProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);

  const handleRowClick = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks, index);
    }
  };

  const handleAddToQueue = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    addToQueue(track);
    setQueuedNotification(track.id);
    setTimeout(() => {
      setQueuedNotification(null);
    }, 1500);
  };

  return (
    <table className="track-table">
      <thead>
        <tr>
          <th className="track-th" style={{ width: 48, textAlign: "center" }}>#</th>
          <th className="track-th">Título</th>
          {showAlbumColumn && <th className="track-th">Álbum</th>}
          <th className="track-th" style={{ width: 60, textAlign: "right" }}>
            <Clock size={16} />
          </th>
          <th className="track-th" style={{ width: 90, textAlign: "center" }}></th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;
          const isRowHovered = hoveredRowId === track.id;

          return (
            <tr
              key={track.id}
              className={`track-row ${isCurrent ? "playing" : ""}`}
              onMouseEnter={() => setHoveredRowId(track.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              onClick={() => handleRowClick(track, idx)}
            >
              {/* Coluna # / Play Icon */}
              <td className="track-td" style={{ textAlign: "center", width: 48 }}>
                {isRowHovered ? (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-base)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                  </button>
                ) : isCurrent ? (
                  <span style={{ color: "var(--spotify-green)", fontWeight: 700 }}>
                    {isPlaying ? "▶" : idx + 1}
                  </span>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </td>

              {/* Título & Artista */}
              <td className="track-td">
                <div className="track-title-cell">
                  <img
                    src={track.album.cover_url}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span
                      className="track-title-text"
                      style={{ color: isCurrent ? "var(--spotify-green)" : "var(--text-base)" }}
                    >
                      {track.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {track.explicit && <span className="badge-explicit">E</span>}
                      <span className="track-artist-text">
                        {track.artists.map((a) => a.name).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Álbum */}
              {showAlbumColumn && (
                <td className="track-td" style={{ color: "var(--text-subdued)" }}>
                  {track.album.title}
                </td>
              )}

              {/* Duração */}
              <td className="track-td" style={{ textAlign: "right", color: "var(--text-subdued)" }}>
                {formatTime(track.duration_ms / 1000)}
              </td>

              {/* Ações (Adicionar à Fila) */}
              <td className="track-td" style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <button
                    className="control-btn"
                    onClick={(e) => handleAddToQueue(e, track)}
                    title="Adicionar à fila prioritária"
                    style={{
                      opacity: isRowHovered || queuedNotification === track.id ? 1 : 0,
                      color: queuedNotification === track.id ? "var(--spotify-green)" : "var(--text-subdued)",
                    }}
                  >
                    {queuedNotification === track.id ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                  <button
                    className="control-btn"
                    onClick={(e) => e.stopPropagation()}
                    style={{ opacity: isRowHovered ? 1 : 0 }}
                  >
                    <Heart size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
