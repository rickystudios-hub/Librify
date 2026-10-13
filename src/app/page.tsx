"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { MOCK_ALBUMS, MOCK_PLAYLISTS, MOCK_ARTISTS, MOCK_TRACKS } from "@/lib/mockData";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Track } from "@/types/music";
import { Play, Sparkles } from "lucide-react";

function YoutubeIcon({ size = 22, color = "#ff0000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function HomePage() {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  useEffect(() => {
    fetch("/api/yt/trending")
      .then((res) => res.json())
      .then((data) => {
        if (data.tracks) {
          setTrendingTracks(data.tracks);
        }
      })
      .catch((err) => console.error("Falha ao carregar tendências:", err))
      .finally(() => setIsLoadingTrending(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleQuickPlay = (e: React.MouseEvent, tracks = MOCK_TRACKS) => {
    e.preventDefault();
    e.stopPropagation();
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  return (
    <div style={{ paddingBottom: 64 }}>
      <TopNav />

      <div style={{ padding: "0 32px" }}>
        {/* Saudação */}
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "20px 0 16px 0", letterSpacing: "-0.5px" }}>
          {getGreeting()}
        </h1>

        {/* Quick Access Grid (6 Top Cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
            marginBottom: 36,
          }}
        >
          {MOCK_PLAYLISTS.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 4,
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                transition: "background-color 0.2s ease",
              }}
              className="quick-card"
            >
              <img
                src={playlist.cover_url}
                alt=""
                style={{ width: 64, height: 64, objectFit: "cover" }}
              />
              <span
                style={{
                  padding: "0 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {playlist.title}
              </span>
              <button
                className="card-play-btn"
                onClick={(e) => handleQuickPlay(e, playlist.tracks)}
                style={{
                  position: "relative",
                  marginRight: 12,
                  width: 44,
                  height: 44,
                  opacity: 1,
                  transform: "none",
                }}
              >
                <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
              </button>
            </Link>
          ))}
        </div>

        {/* Seção Nova: Tendências ao Vivo (YouTube Direct) */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <YoutubeIcon size={24} color="#ff0000" />
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Top Músicas Globais (Ao Vivo do YouTube)</h2>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-subdued)", display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={14} color="var(--spotify-green)" /> Streaming Aberto
            </span>
          </div>

          {isLoadingTrending ? (
            <p style={{ color: "var(--text-subdued)", fontSize: 14 }}>Carregando hits do YouTube...</p>
          ) : (
            <div className="grid-container">
              {trendingTracks.slice(0, 6).map((track, idx) => (
                <div
                  key={track.id}
                  className="music-card"
                  onClick={() => playTrack(track, trendingTracks, idx)}
                >
                  <div className="card-img-wrapper">
                    <img src={track.album.cover_url} alt="" className="card-img" />
                    <button className="card-play-btn">
                      <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {track.title}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-subdued)" }}>
                      {track.artists.map((a) => a.name).join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção: Feito para Você */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Feito para você</h2>
          </div>

          <div className="grid-container">
            {MOCK_PLAYLISTS.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="music-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card-img-wrapper">
                  <img src={playlist.cover_url} alt="" className="card-img" />
                  <button
                    className="card-play-btn"
                    onClick={(e) => handleQuickPlay(e, playlist.tracks)}
                  >
                    <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {playlist.title}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-subdued)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {playlist.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Seção: Álbuns Populares */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Álbuns Populares</h2>
          </div>

          <div className="grid-container">
            {MOCK_ALBUMS.map((album) => (
              <div
                key={album.id}
                className="music-card"
                onClick={() => {
                  const albumTracks = MOCK_TRACKS.filter((t) => t.album.id === album.id);
                  if (albumTracks.length > 0) {
                    playTrack(albumTracks[0], albumTracks, 0);
                  }
                }}
              >
                <div className="card-img-wrapper">
                  <img src={album.cover_url} alt="" className="card-img" />
                  <button className="card-play-btn">
                    <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {album.title}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-subdued)" }}>
                    {typeof album.artist === "string" ? album.artist : album.artist.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seção: Artistas em Alta */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Artistas em Alta</h2>
          </div>

          <div className="grid-container">
            {MOCK_ARTISTS.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="music-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card-img-wrapper" style={{ borderRadius: "50%" }}>
                  <img src={artist.avatar_url} alt="" className="card-img" />
                  <button
                    className="card-play-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const artistTracks = MOCK_TRACKS.filter((t) => t.artists.some((a) => a.id === artist.id));
                      if (artistTracks.length > 0) {
                        playTrack(artistTracks[0], artistTracks, 0);
                      }
                    }}
                  >
                    <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{artist.name}</span>
                  <span style={{ fontSize: 13, color: "var(--text-subdued)" }}>Artista</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
