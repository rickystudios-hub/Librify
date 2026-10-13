"use client";

import React, { use } from "react";
import { TopNav } from "@/components/TopNav";
import { TrackTable } from "@/components/TrackTable";
import { MOCK_PLAYLISTS, MOCK_TRACKS } from "@/lib/mockData";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playlist = MOCK_PLAYLISTS.find((p) => p.id === id) || MOCK_PLAYLISTS[0];
  const tracks = playlist.tracks.length > 0 ? playlist.tracks : MOCK_TRACKS;

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrentPlaylistPlaying = tracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayHero = () => {
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const totalDurationMs = tracks.reduce((acc, t) => acc + t.duration_ms, 0);
  const totalMinutes = Math.floor(totalDurationMs / 60000);

  return (
    <div style={{ paddingBottom: 64 }}>
      <TopNav />

      {/* Hero Header com Gradiente */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 24,
          padding: "24px 32px 28px 32px",
          background: "linear-gradient(180deg, #3d2a70 0%, #1a142e 100%)",
        }}
      >
        <img
          src={playlist.cover_url}
          alt={playlist.title}
          style={{
            width: 232,
            height: 232,
            borderRadius: 4,
            objectFit: "cover",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
            Playlist
          </span>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 64px)",
              fontWeight: 900,
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            {playlist.title}
          </h1>
          {playlist.description && (
            <p style={{ fontSize: 14, color: "var(--text-subdued)", marginTop: 4 }}>
              {playlist.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginTop: 8 }}>
            <span style={{ fontWeight: 700 }}>Librify</span>
            <span>•</span>
            <span>{tracks.length} músicas,</span>
            <span style={{ color: "var(--text-subdued)" }}>aproximadamente {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Track Table */}
      <div style={{ padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "20px 0" }}>
          <button
            onClick={handlePlayHero}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "var(--spotify-green)",
              color: "var(--bg-black)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease, background-color 0.15s ease",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isCurrentPlaylistPlaying ? (
              <Pause size={26} fill="currentColor" />
            ) : (
              <Play size={26} fill="currentColor" style={{ marginLeft: 3 }} />
            )}
          </button>

          <button className="control-btn" style={{ padding: 8 }}>
            <Heart size={32} />
          </button>

          <button className="control-btn" style={{ padding: 8 }}>
            <MoreHorizontal size={32} />
          </button>
        </div>

        {/* Tabela de Faixas */}
        <TrackTable tracks={tracks} />
      </div>
    </div>
  );
}
