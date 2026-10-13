"use client";

import React, { use, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { TrackTable } from "@/components/TrackTable";
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_ALBUMS } from "@/lib/mockData";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause, BadgeCheck, MoreHorizontal } from "lucide-react";

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const artist = MOCK_ARTISTS.find((a) => a.id === id) || MOCK_ARTISTS[0];
  const artistTracks = MOCK_TRACKS.filter((t) => t.artists.some((a) => a.id === artist.id));
  const artistAlbums = MOCK_ALBUMS.filter((alb) =>
    typeof alb.artist === "string" ? alb.artist === artist.name : alb.artist.id === artist.id
  );

  const [isFollowing, setIsFollowing] = useState(false);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrentArtistPlaying = artistTracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayHero = () => {
    if (isCurrentArtistPlaying) {
      togglePlay();
    } else if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks, 0);
    }
  };

  return (
    <div style={{ paddingBottom: 64 }}>
      <TopNav />

      {/* Hero Header Gigante com Imagem de Fundo do Artista */}
      <div
        style={{
          position: "relative",
          height: 340,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 32px 32px 32px",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(18, 18, 18, 1) 100%), url(${artist.avatar_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <BadgeCheck size={24} fill="#3d91f4" color="white" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Artista Verificado</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 76px)",
            fontWeight: 900,
            letterSpacing: "-2px",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          {artist.name}
        </h1>

        <span style={{ fontSize: 16, color: "var(--text-subdued)" }}>
          {artist.monthly_listeners?.toLocaleString("pt-BR")} ouvintes mensais
        </span>
      </div>

      {/* Action Bar */}
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
              transition: "transform 0.15s ease",
            }}
          >
            {isCurrentArtistPlaying ? (
              <Pause size={26} fill="currentColor" />
            ) : (
              <Play size={26} fill="currentColor" style={{ marginLeft: 3 }} />
            )}
          </button>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            style={{
              background: isFollowing ? "transparent" : "var(--bg-elevated)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "var(--text-base)",
              borderRadius: 24,
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "border-color 0.2s ease, transform 0.15s ease",
            }}
          >
            {isFollowing ? "Seguindo" : "Seguir"}
          </button>

          <button className="control-btn" style={{ padding: 8 }}>
            <MoreHorizontal size={32} />
          </button>
        </div>

        {/* Músicas Populares */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Populares</h2>
          <TrackTable tracks={artistTracks} showAlbumColumn={false} />
        </section>

        {/* Discografia */}
        {artistAlbums.length > 0 && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Discografia</h2>
            <div className="grid-container">
              {artistAlbums.map((album) => (
                <div key={album.id} className="music-card">
                  <div className="card-img-wrapper">
                    <img src={album.cover_url} alt="" className="card-img" />
                    <button
                      className="card-play-btn"
                      onClick={() => {
                        const albumTracks = MOCK_TRACKS.filter((t) => t.album.id === album.id);
                        if (albumTracks.length > 0) {
                          playTrack(albumTracks[0], albumTracks, 0);
                        }
                      }}
                    >
                      <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                    </button>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{album.title}</span>
                  <span style={{ fontSize: 13, color: "var(--text-subdued)" }}>
                    {album.release_date.split("-")[0]} • Álbum
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
