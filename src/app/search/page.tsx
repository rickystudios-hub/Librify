"use client";

import React, { useState, useEffect, useRef } from "react";
import { TopNav } from "@/components/TopNav";
import { TrackTable } from "@/components/TrackTable";
import { Track } from "@/types/music";
import { Search, Sparkles } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

function YoutubeIcon({ size = 20, color = "#ff0000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const GENRE_CARDS = [
  { title: "Músicas em Alta", query: "Músicas mais tocadas 2024", color: "#e13300", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80" },
  { title: "Eletrônica & EDM", query: "Electronic dance music mix", color: "#1e3264", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80" },
  { title: "Pop Internacional", query: "Top Pop hits", color: "#8d67ab", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" },
  { title: "Rock Clássico", query: "Classic Rock hits", color: "#e91429", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80" },
  { title: "Hip-Hop & Trap", query: "Top Hip Hop music", color: "#ba5d07", img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80" },
  { title: "Lofi & Chill Beats", query: "Lofi hip hop beats to relax/study to", color: "#503750", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80" },
  { title: "Indie Alternativo", query: "Indie rock acoustic hits", color: "#477d95", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80" },
  { title: "Sertanejo & Brasil", query: "Top Sertanejo mais tocadas", color: "#169c46", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80" },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Debounce de 300ms
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt/search?q=${encodeURIComponent(searchTerm)}`, { signal });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.tracks || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Erro ao buscar no YouTube:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const topResult = searchResults[0];

  return (
    <div style={{ paddingBottom: 64 }}>
      <TopNav>
        {/* Barra de Busca Dinâmica no TopNav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--bg-elevated)",
            borderRadius: 500,
            padding: "8px 16px",
            width: 380,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Search size={18} color="var(--text-subdued)" style={{ marginRight: 8, flexShrink: 0 }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar qualquer música, artista ou vídeo..."
            style={{
              background: "none",
              border: "none",
              color: "var(--text-base)",
              fontSize: 14,
              outline: "none",
              width: "100%",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{ background: "none", border: "none", color: "var(--text-subdued)", cursor: "pointer", fontSize: 13 }}
            >
              ✕
            </button>
          )}
        </div>
      </TopNav>

      <div style={{ padding: "24px 32px" }}>
        {searchTerm.trim() ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <YoutubeIcon size={20} color="#ff0000" />
              <span style={{ fontSize: 13, color: "var(--text-subdued)" }}>
                Resultados em tempo real transmitidos via YouTube Engine
              </span>
            </div>

            {isSearching ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "40px 0" }}>
                <Sparkles size={24} color="var(--spotify-green)" />
                <p style={{ color: "var(--text-subdued)", fontSize: 15 }}>Buscando faixas no catálogo global...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                {/* Melhor Resultado + Músicas */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 24,
                    marginBottom: 36,
                  }}
                >
                  {/* Top Result Card */}
                  {topResult && (
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                        Melhor resultado
                      </h2>
                      <div
                        className="music-card"
                        onClick={() => playTrack(topResult, searchResults, 0)}
                        style={{ padding: 20 }}
                      >
                        <img
                          src={topResult.album.cover_url}
                          alt=""
                          style={{ width: 100, height: 100, borderRadius: 6, objectFit: "cover" }}
                        />
                        <h3
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            marginTop: 12,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {topResult.title}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginTop: 4 }}>
                          <span style={{ color: "var(--text-subdued)" }}>
                            {topResult.artists.map((a) => a.name).join(", ")}
                          </span>
                          <span style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>
                            YouTube
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top 4 Músicas */}
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                      Músicas Principais
                    </h2>
                    <TrackTable tracks={searchResults.slice(0, 4)} showAlbumColumn={false} />
                  </div>
                </div>

                {/* Todas as Faixas Encontradas */}
                <section>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                    Todas as faixas encontradas ({searchResults.length})
                  </h2>
                  <TrackTable tracks={searchResults} />
                </section>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Nenhum resultado encontrado para &quot;{searchTerm}&quot;</h3>
                <p style={{ color: "var(--text-subdued)", marginTop: 8 }}>
                  Tente digitar o nome de um artista, banda ou título de música.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Categorias / Navegar por todas as seções */
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              Navegar por todas as seções (Catálogo Ilimitado)
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              {GENRE_CARDS.map((genre) => (
                <div
                  key={genre.title}
                  onClick={() => setSearchTerm(genre.query)}
                  style={{
                    backgroundColor: genre.color,
                    borderRadius: 8,
                    height: 180,
                    padding: 16,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ fontSize: 19, fontWeight: 800, color: "white" }}>
                    {genre.title}
                  </span>
                  <img
                    src={genre.img}
                    alt=""
                    style={{
                      position: "absolute",
                      right: -14,
                      bottom: -10,
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      transform: "rotate(25deg)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
