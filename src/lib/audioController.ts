import { usePlayerStore } from "@/store/usePlayerStore";
import { Track } from "@/types/music";
import { youtubePlayer } from "@/lib/youtubePlayer";

/**
 * AudioController Singleton
 * Orquestra o grafo Web Audio API, Dual Audio Nodes para Gapless Preloading,
 * integração nativa com o YouTube Player Headless e sincronização com o Zustand.
 */
class AudioController {
  private static instance: AudioController | null = null;

  // Nós de áudio HTML5
  private activeAudio: HTMLAudioElement | null = null;
  private preloadAudio: HTMLAudioElement | null = null;

  // Web Audio API
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  private isInitialized = false;
  private unsubscribeStore: (() => void) | null = null;
  private lastTrackId: string | null = null;
  private preloadedTrackId: string | null = null;

  private constructor() {}

  public static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }

  /**
   * Inicializa os elementos de áudio e listeners da store
   */
  public init(): void {
    if (this.isInitialized || typeof window === "undefined") return;

    this.activeAudio = new Audio();
    this.activeAudio.preload = "auto";
    this.activeAudio.crossOrigin = "anonymous";

    this.preloadAudio = new Audio();
    this.preloadAudio.preload = "auto";
    this.preloadAudio.crossOrigin = "anonymous";

    this.setupAudioListeners(this.activeAudio);
    this.setupStoreSubscriber();
    this.setupMediaSession();

    this.isInitialized = true;
  }

  private ensureAudioContext(): void {
    if (!this.audioContext && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && this.activeAudio) {
        this.audioContext = new AudioCtx();
        this.gainNode = this.audioContext.createGain();

        try {
          this.sourceNode = this.audioContext.createMediaElementSource(this.activeAudio);
          this.sourceNode.connect(this.gainNode);
          this.gainNode.connect(this.audioContext.destination);
        } catch {
          // Fallback
        }
      }
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  private setupAudioListeners(audio: HTMLAudioElement): void {
    audio.addEventListener("timeupdate", () => {
      const state = usePlayerStore.getState();
      if (!state.currentTrack?.youtube_id && !state.isSeeking) {
        state.setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      const state = usePlayerStore.getState();
      if (!state.currentTrack?.youtube_id && audio.duration && !isNaN(audio.duration)) {
        state.setDuration(audio.duration);
      }
    });

    audio.addEventListener("ended", () => {
      const state = usePlayerStore.getState();
      if (!state.currentTrack?.youtube_id) {
        state.nextTrack();
      }
    });

    audio.addEventListener("error", (e) => {
      console.warn("[AudioController] Erro na reprodução:", e);
    });
  }

  private setupStoreSubscriber(): void {
    this.unsubscribeStore = usePlayerStore.subscribe((state, prevState) => {
      // 1. Mudança de Faixa
      if (state.currentTrack && state.currentTrack.id !== this.lastTrackId) {
        this.lastTrackId = state.currentTrack.id;
        this.loadAndPlay(state.currentTrack);
      }

      const isYouTube = Boolean(state.currentTrack?.youtube_id);

      // 2. Play / Pause
      if (state.isPlaying !== prevState.isPlaying) {
        if (state.isPlaying) {
          if (isYouTube) {
            youtubePlayer.play();
          } else if (this.activeAudio) {
            this.ensureAudioContext();
            this.activeAudio.play().catch((err) => {
              console.warn("[AudioController] Autoplay bloqueado:", err);
            });
          }
        } else {
          if (isYouTube) {
            youtubePlayer.pause();
          } else if (this.activeAudio) {
            this.activeAudio.pause();
          }
        }
      }

      // 3. Volume e Mute
      if (state.volume !== prevState.volume || state.isMuted !== prevState.isMuted) {
        const targetVol = state.isMuted ? 0 : state.volume;

        youtubePlayer.setVolume(targetVol);
        youtubePlayer.setMute(state.isMuted);

        if (this.activeAudio) {
          this.activeAudio.volume = targetVol;
        }
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(targetVol, this.audioContext?.currentTime || 0);
        }
      }

      // 4. Seek requisitado
      if (!state.isSeeking && prevState.isSeeking) {
        this.seek(state.currentTime);
      }

      // 5. Gapless Pre-loading para faixas diretas
      if (!isYouTube) {
        this.handlePreloading(state);
      }
    });
  }

  private loadAndPlay(track: Track): void {
    this.updateMediaSession(track);

    if (track.youtube_id) {
      // Pausa áudio nativo se estiver tocando
      if (this.activeAudio) {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      }
      youtubePlayer.playVideo(track.youtube_id);
      return;
    }

    // Faixa regular HTML5 Audio
    youtubePlayer.stop();

    if (!this.activeAudio) return;
    this.ensureAudioContext();

    if (this.preloadAudio && this.preloadedTrackId === track.id && this.preloadAudio.src) {
      this.activeAudio.src = this.preloadAudio.src;
    } else {
      this.activeAudio.src = track.audio_url;
    }

    this.activeAudio.currentTime = 0;
    this.activeAudio.play().catch((err) => {
      console.warn("[AudioController] Falha ao iniciar reprodução:", err);
    });
  }

  private handlePreloading(state: ReturnType<typeof usePlayerStore.getState>): void {
    if (!this.preloadAudio) return;

    let nextTrack: Track | null = null;
    if (state.userQueue.length > 0) {
      nextTrack = state.userQueue[0];
    } else if (state.contextIndex + 1 < state.contextQueue.length) {
      nextTrack = state.contextQueue[state.contextIndex + 1];
    } else if (state.repeatMode === "all" && state.contextQueue.length > 0) {
      nextTrack = state.contextQueue[0];
    }

    if (nextTrack && !nextTrack.youtube_id && nextTrack.id !== this.preloadedTrackId) {
      this.preloadedTrackId = nextTrack.id;
      this.preloadAudio.src = nextTrack.audio_url;
      this.preloadAudio.load();
    }
  }

  public seek(seconds: number): void {
    const state = usePlayerStore.getState();
    if (state.currentTrack?.youtube_id) {
      youtubePlayer.seek(seconds);
    } else if (this.activeAudio) {
      this.activeAudio.currentTime = seconds;
    }
  }

  private setupMediaSession(): void {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const nav = navigator.mediaSession;
    nav.setActionHandler("play", () => usePlayerStore.getState().play());
    nav.setActionHandler("pause", () => usePlayerStore.getState().pause());
    nav.setActionHandler("nexttrack", () => usePlayerStore.getState().nextTrack());
    nav.setActionHandler("previoustrack", () => usePlayerStore.getState().previousTrack());
    nav.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        usePlayerStore.getState().seekTo(details.seekTime);
        this.seek(details.seekTime);
      }
    });
  }

  private updateMediaSession(track: Track): void {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const artistNames = track.artists.map((a) => a.name).join(", ");
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: artistNames,
      album: track.album.title,
      artwork: [
        { src: track.album.cover_url, sizes: "96x96", type: "image/jpeg" },
        { src: track.album.cover_url, sizes: "256x256", type: "image/jpeg" },
        { src: track.album.cover_url, sizes: "512x512", type: "image/jpeg" },
      ],
    });
  }

  public destroy(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.src = "";
    }
    if (this.preloadAudio) {
      this.preloadAudio.src = "";
    }
    youtubePlayer.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}

export const audioController = AudioController.getInstance();
