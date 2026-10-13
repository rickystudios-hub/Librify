import { NextResponse } from "next/server";
import yts from "yt-search";
import { Track } from "@/types/music";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const results = await yts(q);
    const tracks: Track[] = results.videos.slice(0, 30).map((v, idx) => ({
      id: v.videoId,
      youtube_id: v.videoId,
      title: v.title,
      album: {
        id: `yt-alb-${v.videoId}`,
        title: v.author?.name || "YouTube Music",
        cover_url: v.thumbnail || v.image,
      },
      artists: [
        {
          id: `yt-art-${encodeURIComponent(v.author?.name || "artist")}`,
          name: v.author?.name || "Artista",
          avatar_url: v.thumbnail,
        },
      ],
      duration_ms: (v.duration?.seconds || 0) * 1000,
      track_number: idx + 1,
      audio_url: `https://www.youtube.com/watch?v=${v.videoId}`,
      play_count: v.views || 0,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("[YouTube API] Falha na busca:", error);
    return NextResponse.json({ error: "Falha ao buscar no YouTube" }, { status: 500 });
  }
}
