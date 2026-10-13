"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { audioController } from "@/lib/audioController";
import { useCallback } from "react";

export function useAudioController() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const userQueue = usePlayerStore((s) => s.userQueue);
  const contextQueue = usePlayerStore((s) => s.contextQueue);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const previousTrack = usePlayerStore((s) => s.previousTrack);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const setIsSeeking = usePlayerStore((s) => s.setIsSeeking);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);

  // Manipulação suave de Seek com desacoplamento de drag
  const onSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, [setIsSeeking]);

  const onSeekMove = useCallback(
    (newTime: number) => {
      setCurrentTime(newTime);
    },
    [setCurrentTime]
  );

  const onSeekEnd = useCallback(
    (finalTime: number) => {
      audioController.seek(finalTime);
      usePlayerStore.getState().seekTo(finalTime);
    },
    []
  );

  return {
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
    addToQueue,
    removeFromQueue,
    clearQueue,
    onSeekStart,
    onSeekMove,
    onSeekEnd,
  };
}
