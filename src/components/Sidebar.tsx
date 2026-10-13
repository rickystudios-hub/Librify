"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Plus,
  ArrowRight,
  Pin,
  Music2,
} from "lucide-react";
import { MOCK_PLAYLISTS, MOCK_ARTISTS } from "@/lib/mockData";

export function Sidebar() {
  const pathname = usePathname();
  const [filter, setFilter] = useState<"all" | "playlists" | "artists">("all");

  return (
    <aside className="app-sidebar">
      {/* 1. Navegação Principal */}
      <nav className="nav-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0 8px 0" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--spotify-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bg-black)",
            }}
          >
            <Music2 size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Librify
          </span>
        </div>

        <Link
          href="/"
          className={`nav-item ${pathname === "/" ? "active" : ""}`}
        >
          <Home size={24} />
          <span>Início</span>
        </Link>

        <Link
          href="/search"
          className={`nav-item ${pathname === "/search" ? "active" : ""}`}
        >
          <Search size={24} />
          <span>Buscar</span>
        </Link>
      </nav>

      {/* 2. Sua Biblioteca */}
      <div className="library-box">
        <div className="library-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <Library size={24} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Sua Biblioteca</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="control-btn" title="Criar playlist ou pasta">
              <Plus size={20} />
            </button>
            <button className="control-btn" title="Expandir biblioteca">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Tags de Filtro */}
        <div style={{ display: "flex", gap: 8, padding: "4px 0 12px 0" }}>
          <button
            onClick={() => setFilter(filter === "playlists" ? "all" : "playlists")}
            style={{
              background: filter === "playlists" ? "var(--text-base)" : "var(--bg-elevated)",
              color: filter === "playlists" ? "var(--bg-black)" : "var(--text-base)",
              border: "none",
              borderRadius: 16,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Playlists
          </button>
          <button
            onClick={() => setFilter(filter === "artists" ? "all" : "artists")}
            style={{
              background: filter === "artists" ? "var(--text-base)" : "var(--bg-elevated)",
              color: filter === "artists" ? "var(--bg-black)" : "var(--text-base)",
              border: "none",
              borderRadius: 16,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Artistas
          </button>
        </div>

        {/* Lista de Itens da Biblioteca */}
        <div className="library-items-list">
          {/* Músicas Curtidas (Fixado) */}
          {(filter === "all" || filter === "playlists") && (
            <Link
              href="/playlist/playlist-3"
              className={`library-row ${pathname === "/playlist/playlist-3" ? "active" : ""}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #450af5 0%, #c4efd9 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Pin size={18} fill="white" color="white" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Músicas Curtidas
                </span>
                <span style={{ fontSize: 12, color: "var(--text-subdued)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Pin size={11} fill="var(--spotify-green)" color="var(--spotify-green)" /> Playlist • Fixado
                </span>
              </div>
            </Link>
          )}

          {/* Outras Playlists */}
          {(filter === "all" || filter === "playlists") &&
            MOCK_PLAYLISTS.filter((p) => p.id !== "playlist-3").map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={`library-row ${pathname === `/playlist/${playlist.id}` ? "active" : ""}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img src={playlist.cover_url} alt="" className="library-cover" />
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {playlist.title}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-subdued)" }}>
                    Playlist • {playlist.tracks.length} músicas
                  </span>
                </div>
              </Link>
            ))}

          {/* Artistas */}
          {(filter === "all" || filter === "artists") &&
            MOCK_ARTISTS.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className={`library-row ${pathname === `/artist/${artist.id}` ? "active" : ""}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={artist.avatar_url}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {artist.name}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-subdued)" }}>
                    Artista
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </aside>
  );
}
