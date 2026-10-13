import { usePlayerStore } from "@/store/usePlayerStore";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string,
        config: {
          height: string;
          width: string;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

export interface YTPlayerInstance {
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
}

class YouTubePlayerController {
  private static instance: YouTubePlayerController | null = null;
  private player: YTPlayerInstance | null = null;
  private isReady = false;
  private timeUpdateInterval: NodeJS.Timeout | null = null;
  private pendingVideoId: string | null = null;

  private constructor() {}

  public static getInstance(): YouTubePlayerController {
    if (!YouTubePlayerController.instance) {
      YouTubePlayerController.instance = new YouTubePlayerController();
    }
    return YouTubePlayerController.instance;
  }

  public init(containerId = "youtube-player-host"): void {
    if (typeof window === "undefined" || this.player) return;

    const loadScript = () => {
      if (window.YT && window.YT.Player) {
        this.createPlayer(containerId);
      } else {
        const existingScript = document.getElementById("yt-iframe-api");
        if (!existingScript) {
          const tag = document.createElement("script");
          tag.id = "yt-iframe-api";
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }

        const prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevReady) prevReady();
          this.createPlayer(containerId);
        };
      }
    };

    loadScript();
  }

  private createPlayer(containerId: string): void {
    if (!window.YT) return;

    this.player = new window.YT.Player(containerId, {
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      },
      events: {
        onReady: () => {
          this.isReady = true;
          this.startTimeTracker();
          if (this.pendingVideoId) {
            this.playVideo(this.pendingVideoId);
            this.pendingVideoId = null;
          }
        },
        onStateChange: (event) => {
          const state = usePlayerStore.getState();
          // 0 = ENDED
          if (event.data === 0) {
            state.nextTrack();
          }
          // 1 = PLAYING
          else if (event.data === 1) {
            if (!state.isPlaying) {
              state.play();
            }
          }
          // 2 = PAUSED
          else if (event.data === 2) {
            if (state.isPlaying) {
              state.pause();
            }
          }
        },
        onError: (err) => {
          console.warn("[YouTube Player] Erro na reprodução:", err);
          // Avança para a próxima se o vídeo tiver restrição de embed
          usePlayerStore.getState().nextTrack();
        },
      },
    });
  }

  private startTimeTracker(): void {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);

    this.timeUpdateInterval = setInterval(() => {
      if (!this.player || !this.isReady) return;

      const state = usePlayerStore.getState();
      if (!state.currentTrack?.youtube_id) return;

      try {
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();

        if (duration && !isNaN(duration) && duration > 0 && Math.abs(state.duration - duration) > 1) {
          state.setDuration(duration);
        }

        if (!state.isSeeking && currentTime !== undefined && !isNaN(currentTime)) {
          state.setCurrentTime(currentTime);
        }
      } catch {
        // Player ainda inicializando
      }
    }, 250);
  }

  public playVideo(videoId: string): void {
    if (!this.isReady || !this.player) {
      this.pendingVideoId = videoId;
      return;
    }

    try {
      this.player.loadVideoById(videoId);
      this.player.playVideo();
    } catch (err) {
      console.warn("[YouTube Player] Falha ao carregar vídeo:", err);
    }
  }

  public play(): void {
    if (this.player && this.isReady) {
      this.player.playVideo();
    }
  }

  public pause(): void {
    if (this.player && this.isReady) {
      this.player.pauseVideo();
    }
  }

  public stop(): void {
    if (this.player && this.isReady) {
      this.player.stopVideo();
    }
  }

  public seek(seconds: number): void {
    if (this.player && this.isReady) {
      this.player.seekTo(seconds, true);
    }
  }

  public setVolume(vol: number): void {
    if (this.player && this.isReady) {
      this.player.setVolume(Math.round(vol * 100));
    }
  }

  public setMute(muted: boolean): void {
    if (this.player && this.isReady) {
      if (muted) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    }
  }
}

export const youtubePlayer = YouTubePlayerController.getInstance();
