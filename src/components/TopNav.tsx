"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

export function TopNav({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 50,
        backgroundColor: "rgba(18, 18, 18, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            border: "none",
            color: "var(--text-base)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Voltar"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => router.forward()}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            border: "none",
            color: "var(--text-base)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Avançar"
        >
          <ChevronRight size={22} />
        </button>

        {children}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--text-subdued)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Premium
        </button>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "1px solid var(--border-subtle)",
          }}
          title="Perfil do Usuário"
        >
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
