-- ==============================================================================
-- LIBRIFY DATABASE SCHEMA (PostgreSQL / Supabase)
-- 1:1 Spotify Data Architecture Model
-- ==============================================================================

-- Habilita extensões necessárias para UUIDs e busca textual com trigram
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. USUÁRIOS (Perfis públicos espelhados do Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. ARTISTAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    header_url TEXT,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    monthly_listeners BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. ÁLBUNS
-- ------------------------------------------------------------------------------
CREATE TYPE album_type_enum AS ENUM ('album', 'single', 'ep', 'compilation');

CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    cover_url TEXT NOT NULL,
    release_date DATE NOT NULL,
    album_type album_type_enum DEFAULT 'album' NOT NULL,
    total_tracks INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. FAIXAS (TRACKS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    duration_ms INT NOT NULL, -- Duração exata em milissegundos
    track_number INT NOT NULL,
    disc_number INT DEFAULT 1 NOT NULL,
    audio_url TEXT NOT NULL, -- URL do arquivo de áudio (Supabase Storage / CDN)
    waveform_data JSONB, -- Array de picos para renderização instantânea da forma de onda
    explicit BOOLEAN DEFAULT FALSE NOT NULL,
    play_count BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Junção Many-to-Many entre Faixas e Artistas (Suporte a múltiplos artistas e 'feat')
CREATE TABLE IF NOT EXISTS public.track_artists (
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'primary' NOT NULL, -- 'primary', 'featured', 'producer'
    position INT DEFAULT 0 NOT NULL,
    PRIMARY KEY (track_id, artist_id)
);

-- ------------------------------------------------------------------------------
-- 5. PLAYLISTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    is_collaborative BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Junção de Playlist com Faixas (Ordem estrita via campo position)
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    position DOUBLE PRECISION NOT NULL, -- Double Precision para reordenação eficiente estilo Lexorank
    added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_playlist_track_pos UNIQUE (playlist_id, position)
);

-- ------------------------------------------------------------------------------
-- 6. BIBLIOTECA DO USUÁRIO (LIKES & SEGUIDORES)
-- ------------------------------------------------------------------------------
-- Músicas Curtidas (Liked Songs)
CREATE TABLE IF NOT EXISTS public.user_saved_tracks (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, track_id)
);

-- Álbuns Salvos
CREATE TABLE IF NOT EXISTS public.user_saved_albums (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, album_id)
);

-- Artistas Seguidos
CREATE TABLE IF NOT EXISTS public.user_followed_artists (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, artist_id)
);

-- ------------------------------------------------------------------------------
-- 7. ÍNDICES DE ALTA PERFORMANCE
-- ------------------------------------------------------------------------------
-- Trigram indexes para busca instantânea ultrarrápida (Debounced Search)
CREATE INDEX IF NOT EXISTS idx_tracks_title_trgm ON public.tracks USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_artists_name_trgm ON public.artists USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_albums_title_trgm ON public.albums USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_playlists_title_trgm ON public.playlists USING gin (title gin_trgm_ops);

-- B-Tree indexes para junções e paginação ordenada de listas de 10.000+ faixas
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_position ON public.playlist_tracks (playlist_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON public.tracks (album_id, track_number ASC);
CREATE INDEX IF NOT EXISTS idx_user_saved_tracks_user_date ON public.user_saved_tracks (user_id, added_at DESC);

-- ------------------------------------------------------------------------------
-- 8. SEGURANÇA E POLÍTICAS RLS (Row Level Security)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followed_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Catálogo geral: Leitura pública
CREATE POLICY "Catalogo público para todos os usuários" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Álbuns públicos para todos" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Artistas públicos para todos" ON public.artists FOR SELECT USING (true);

-- Playlists: Leitura se pública ou se pertence ao dono
CREATE POLICY "Playlists públicas ou próprias visíveis" ON public.playlists 
    FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Dono gerencia sua própria playlist" ON public.playlists 
    FOR ALL USING (auth.uid() = user_id);

-- Playlist Tracks: Segue a visibilidade da playlist pai
CREATE POLICY "Faixas visíveis se playlist visível" ON public.playlist_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.playlists p 
            WHERE p.id = playlist_tracks.playlist_id 
            AND (p.is_public = TRUE OR p.user_id = auth.uid())
        )
    );

-- User Saved Tracks (Músicas curtidas isoladas por usuário)
CREATE POLICY "Acesso apenas às próprias músicas salvas" ON public.user_saved_tracks
    FOR ALL USING (auth.uid() = user_id);
