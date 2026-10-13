import { create } from "zustand";
import { Track, RepeatMode, PlayerState } from "@/types/music";
import { balancedShuffle } from "@/lib/shuffle";

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Estado inicial
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isSeeking: false,

  isShuffle: false,
  repeatMode: "off",

  userQueue: [],
  contextQueue: [],
  originalContextQueue: [],
  history: [],
  contextIndex: -1,

  // Ação principal de reprodução
  playTrack: (track: Track, context?: Track[], index?: number) => {
    const state = get();
    const newHistory = state.currentTrack
      ? [...state.history, state.currentTrack]
      : state.history;

    let targetContext = context || state.originalContextQueue;
    if (!targetContext || targetContext.length === 0) {
      targetContext = [track];
    }

    let resolvedIndex = 0;
    let effectiveContextQueue = targetContext;

    if (state.isShuffle) {
      // No shuffle, a faixa atual fica no início da nova fila balanceada
      const remainingTracks = targetContext.filter((t) => t.id !== track.id);
      const shuffled = balancedShuffle(remainingTracks);
      effectiveContextQueue = [track, ...shuffled];
      resolvedIndex = 0;
    } else {
      if (index !== undefined && index >= 0) {
        resolvedIndex = index;
      } else {
        const found = targetContext.findIndex((t) => t.id === track.id);
        resolvedIndex = found >= 0 ? found : 0;
      }
    }

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration_ms / 1000,
      originalContextQueue: targetContext,
      contextQueue: effectiveContextQueue,
      contextIndex: resolvedIndex,
      history: newHistory.slice(-50), // Preserva histórico recente
    });
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    set({ isPlaying: !isPlaying });
  },

  play: () => {
    if (get().currentTrack) {
      set({ isPlaying: true });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  nextTrack: () => {
    const state = get();
    const { currentTrack, repeatMode, userQueue, contextQueue, contextIndex, originalContextQueue, isShuffle } = state;

    if (!currentTrack) return;

    // Repetir faixa atual
    if (repeatMode === "one") {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    // Histórico atualizado
    const newHistory = [...state.history, currentTrack].slice(-50);

    // 1. Prioridade máxima: Fila do Usuário (User Queue)
    if (userQueue.length > 0) {
      const nextFromUserQueue = userQueue[0];
      const remainingUserQueue = userQueue.slice(1);

      set({
        currentTrack: nextFromUserQueue,
        userQueue: remainingUserQueue,
        isPlaying: true,
        currentTime: 0,
        duration: nextFromUserQueue.duration_ms / 1000,
        history: newHistory,
      });
      return;
    }

    // 2. Fila de Contexto (Context Queue)
    const nextContextIndex = contextIndex + 1;

    if (nextContextIndex < contextQueue.length) {
      const nextTrackFromContext = contextQueue[nextContextIndex];
      set({
        currentTrack: nextTrackFromContext,
        contextIndex: nextContextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrackFromContext.duration_ms / 1000,
        history: newHistory,
      });
      return;
    }

    // 3. Fim da fila: verificar se modo Repeat All está ativo
    if (repeatMode === "all" && contextQueue.length > 0) {
      let resetContextQueue = contextQueue;
      if (isShuffle) {
        resetContextQueue = balancedShuffle(originalContextQueue);
      }
      const firstTrack = resetContextQueue[0];
      set({
        currentTrack: firstTrack,
        contextQueue: resetContextQueue,
        contextIndex: 0,
        isPlaying: true,
        currentTime: 0,
        duration: firstTrack.duration_ms / 1000,
        history: newHistory,
      });
      return;
    }

    // Fim da lista e sem repetição
    set({ isPlaying: false, currentTime: 0 });
  },

  previousTrack: () => {
    const state = get();
    const { currentTrack, currentTime, history, contextQueue, contextIndex } = state;

    if (!currentTrack) return;

    // Se já tocou mais de 3 segundos, retrocede para o início da mesma faixa (Padrão Spotify)
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    // Se há faixas no histórico, volta para a última
    if (history.length > 0) {
      const prevTrack = history[history.length - 1];
      const newHistory = history.slice(0, -1);

      // Atualiza o índice do contexto caso a faixa anterior pertença ao contexto
      const foundIdx = contextQueue.findIndex((t) => t.id === prevTrack.id);

      set({
        currentTrack: prevTrack,
        history: newHistory,
        contextIndex: foundIdx >= 0 ? foundIdx : contextIndex,
        currentTime: 0,
        duration: prevTrack.duration_ms / 1000,
        isPlaying: true,
      });
      return;
    }

    // Caso não haja histórico, mas o índice de contexto > 0
    if (contextIndex > 0) {
      const prevIndex = contextIndex - 1;
      const prevTrack = contextQueue[prevIndex];
      set({
        currentTrack: prevTrack,
        contextIndex: prevIndex,
        currentTime: 0,
        duration: prevTrack.duration_ms / 1000,
        isPlaying: true,
      });
      return;
    }

    // Senão apenas reseta o início da música
    set({ currentTime: 0 });
  },

  seekTo: (seconds: number) => {
    set({ currentTime: seconds, isSeeking: false });
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    set({ isMuted: !isMuted, volume: !isMuted ? 0 : volume === 0 ? 0.8 : volume });
  },

  toggleShuffle: () => {
    const { isShuffle, originalContextQueue, currentTrack } = get();
    const nextShuffle = !isShuffle;

    if (nextShuffle) {
      if (!currentTrack) {
        set({ isShuffle: true, contextQueue: balancedShuffle(originalContextQueue) });
        return;
      }
      const otherTracks = originalContextQueue.filter((t) => t.id !== currentTrack.id);
      const shuffled = balancedShuffle(otherTracks);
      set({
        isShuffle: true,
        contextQueue: [currentTrack, ...shuffled],
        contextIndex: 0,
      });
    } else {
      // Desativa shuffle e restaura ordem original
      const restoredIndex = currentTrack
        ? originalContextQueue.findIndex((t) => t.id === currentTrack.id)
        : 0;

      set({
        isShuffle: false,
        contextQueue: [...originalContextQueue],
        contextIndex: restoredIndex >= 0 ? restoredIndex : 0,
      });
    }
  },

  setRepeatMode: (mode?: RepeatMode) => {
    if (mode) {
      set({ repeatMode: mode });
      return;
    }
    // Ciclo: off -> all -> one -> off
    const current = get().repeatMode;
    const next: RepeatMode = current === "off" ? "all" : current === "all" ? "one" : "off";
    set({ repeatMode: next });
  },

  addToQueue: (track: Track) => {
    set((state) => ({
      userQueue: [...state.userQueue, track],
    }));
  },

  removeFromQueue: (index: number) => {
    set((state) => ({
      userQueue: state.userQueue.filter((_, i) => i !== index),
    }));
  },

  clearQueue: () => {
    set({ userQueue: [] });
  },

  setCurrentTime: (time: number) => {
    if (!get().isSeeking) {
      set({ currentTime: time });
    }
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  setIsSeeking: (isSeeking: boolean) => {
    set({ isSeeking });
  },
}));
