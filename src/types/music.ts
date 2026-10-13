export interface Artist {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  verified?: boolean;
  monthly_listeners?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: Artist | string;
  cover_url: string;
  release_date: string;
  total_tracks?: number;
}

export interface Track {
  id: string;
  title: string;
  album: {
    id: string;
    title: string;
    cover_url: string;
  };
  artists: Artist[];
  duration_ms: number;
  track_number: number;
  audio_url: string;
  youtube_id?: string;
  explicit?: boolean;
  waveform_data?: number[];
  play_count?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  user_id: string;
  tracks: Track[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  // Estado básico
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isSeeking: boolean;

  // Modos de reprodução
  isShuffle: boolean;
  repeatMode: RepeatMode;

  // Filas estruturadas (Arquitetura Reversa do Spotify)
  userQueue: Track[];          // Fila explícita (adicionadas manualmente pelo usuário)
  contextQueue: Track[];       // Fila de contexto (playlist, álbum ou rádio atual)
  originalContextQueue: Track[]; // Ordem original antes do shuffle
  history: Track[];            // Pilha de faixas reproduzidas (para botão Anterior)
  contextIndex: number;        // Índice na fila de contexto atual

  // Ações do Player
  playTrack: (track: Track, context?: Track[], index?: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode?: RepeatMode) => void;

  // Gerenciamento de Fila
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Sincronização de progresso
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsSeeking: (isSeeking: boolean) => void;
}
