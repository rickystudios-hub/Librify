import { Track } from "@/types/music";

/**
 * Algoritmo de Shuffle Balanceado (Baseado no algoritmo oficial do Spotify)
 * Evita o "Clustering Illusion" onde faixas do mesmo artista tocam em sequência.
 * Espalha as faixas de cada artista de forma equidistante com um leve jitter pseudoaleatório.
 */
export function balancedShuffle(tracks: Track[]): Track[] {
  if (tracks.length <= 2) {
    return [...tracks].sort(() => Math.random() - 0.5);
  }

  const n = tracks.length;

  // 1. Agrupar faixas por artista principal
  const artistMap = new Map<string, Track[]>();
  for (const track of tracks) {
    const artistId = track.artists[0]?.id || track.artists[0]?.name || "unknown";
    if (!artistMap.has(artistId)) {
      artistMap.set(artistId, []);
    }
    artistMap.get(artistId)!.push(track);
  }

  // 2. Para cada artista, embaralhar internamente suas próprias faixas
  const artistEntries = Array.from(artistMap.entries()).map(([artistId, list]) => {
    return {
      artistId,
      tracks: [...list].sort(() => Math.random() - 0.5),
    };
  });

  // 3. Ordenar artistas do que tem mais faixas para o que tem menos faixas
  artistEntries.sort((a, b) => b.tracks.length - a.tracks.length);

  // 4. Atribuir a cada faixa uma posição ideal aproximada com dither aleatório
  interface PositionedTrack {
    track: Track;
    score: number;
  }

  const positionedTracks: PositionedTrack[] = [];

  for (const { tracks: artistTracks } of artistEntries) {
    const count = artistTracks.length;
    const interval = n / count;

    for (let i = 0; i < count; i++) {
      // Posição base equidistante
      const basePos = i * interval;
      // Jitter gaussiano controlado (±25% do intervalo) para garantir variação sem agrupar
      const jitter = (Math.random() - 0.5) * (interval * 0.5);
      const score = Math.max(0, Math.min(n, basePos + jitter));

      positionedTracks.push({
        track: artistTracks[i],
        score,
      });
    }
  }

  // 5. Ordenar por score computado
  positionedTracks.sort((a, b) => a.score - b.score);

  // 6. Pós-processamento de desambiguação: se dois vizinhos imediatos tiverem o mesmo artista,
  // fazemos swap com um elemento subsequente que tenha artista diferente
  const result: Track[] = positionedTracks.map((pt) => pt.track);

  for (let i = 0; i < result.length - 1; i++) {
    const currentArtist = result[i].artists[0]?.id || result[i].artists[0]?.name;
    const nextArtist = result[i + 1].artists[0]?.id || result[i + 1].artists[0]?.name;

    if (currentArtist && nextArtist && currentArtist === nextArtist) {
      // Procura o próximo elemento com artista diferente para swap
      for (let j = i + 2; j < Math.min(result.length, i + 8); j++) {
        const candidateArtist = result[j].artists[0]?.id || result[j].artists[0]?.name;
        if (candidateArtist !== currentArtist) {
          const temp = result[i + 1];
          result[i + 1] = result[j];
          result[j] = temp;
          break;
        }
      }
    }
  }

  return result;
}
