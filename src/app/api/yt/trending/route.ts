import { NextResponse } from "next/server";
import yts from "yt-search";
import { Track } from "@/types/music";

export async function GET() {
  try {
    const results = await yts("Top Hits Global 2024");
    const tracks: Track[] = results.videos.slice(0, 20).map((v, idx) => ({
      id: v.videoId,
      youtube_id: v.videoId,
      title: v.title,
      album: {
        id: `yt-alb-${v.videoId}`,
        title: v.author?.name || "YouTube Hits",
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
    console.error("[YouTube API] Falha nas tendências:", error);
    return NextResponse.json({ error: "Falha ao carregar tendências" }, { status: 500 });
  }
}
