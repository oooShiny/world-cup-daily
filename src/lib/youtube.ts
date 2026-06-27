import type { PlaylistClip } from "./types";

const PLAYLIST_RSS =
  "https://www.youtube.com/feeds/videos.xml?playlist_id=PLSoN6Th-EepPwghaQWR2NLOHb1HLZd2ad";

export async function fetchPlaylistClips(): Promise<PlaylistClip[]> {
  try {
    const res = await fetch(PLAYLIST_RSS, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parsePlaylistXml(xml);
  } catch {
    return [];
  }
}

function firstCapture(re: RegExp, s: string): string | null {
  return re.exec(s)?.[1]?.trim() ?? null;
}

function parseMatchInfo(desc: string): { matchDesc: string | null; matchDate: string | null } {
  // "Check out this in-game content from Norway vs France on 6/26/2026"
  const m = /from (.+?) vs\.? (.+?) on (\d+)\/(\d+)\/(\d{4})/i.exec(desc);
  if (m) {
    const matchDesc = `${m[1].trim()} vs ${m[2].trim()}`;
    const month = m[3].padStart(2, "0");
    const day = m[4].padStart(2, "0");
    const year = m[5];
    return { matchDesc, matchDate: `${year}-${month}-${day}` };
  }
  return { matchDesc: null, matchDate: null };
}

function parsePlaylistXml(xml: string): PlaylistClip[] {
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const clips: PlaylistClip[] = [];
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = firstCapture(/<yt:videoId>(.*?)<\/yt:videoId>/, entry);
    const title = firstCapture(/<media:title>(.*?)<\/media:title>/, entry);
    const desc = firstCapture(/<media:description>([\s\S]*?)<\/media:description>/, entry);
    if (!videoId || !title) continue;
    const { matchDesc, matchDate } = parseMatchInfo(desc ?? "");
    clips.push({ videoId, title, matchDesc, matchDate });
  }
  return clips;
}
