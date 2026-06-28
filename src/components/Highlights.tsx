"use client";

import { useMemo, useState } from "react";
import type { Match, PlaylistClip, Team } from "@/lib/types";
import { formatMatchDate } from "@/lib/format";
import { matchInvolvesTeam } from "@/lib/teams";
import { useTeamFilter } from "./TeamFilterContext";

const HIGHLIGHTS_PAGE_SIZE = 6;

function highlightSearchUrl(match: Match): string {
  const home = match.homeTeam.name ?? match.homeTeam.shortName ?? "";
  const away = match.awayTeam.name ?? match.awayTeam.shortName ?? "";
  const query = `${home} vs ${away} highlights FIFA World Cup 2026`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function normalizeTeam(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function teamMatchesName(team: Team, extracted: string): boolean {
  const normExtracted = normalizeTeam(extracted);
  const candidates = [team.name, team.shortName, team.tla].filter(Boolean) as string[];
  return candidates.some((c) => {
    const normC = normalizeTeam(c);
    return normC === normExtracted || normC.includes(normExtracted) || normExtracted.includes(normC);
  });
}

function getClipsForMatch(clips: PlaylistClip[], match: Match): PlaylistClip[] {
  if (!clips.length) return [];
  const matchDate = match.utcDate.slice(0, 10);
  return clips.filter((clip) => {
    if (!clip.matchDate || clip.matchDate !== matchDate) return false;
    if (!clip.matchDesc) return false;
    const parts = clip.matchDesc.split(/\s+vs\s+/i);
    if (parts.length !== 2) return false;
    const homeInClip =
      teamMatchesName(match.homeTeam, parts[0]) || teamMatchesName(match.homeTeam, parts[1]);
    const awayInClip =
      teamMatchesName(match.awayTeam, parts[0]) || teamMatchesName(match.awayTeam, parts[1]);
    return homeInClip && awayInClip;
  });
}

export function Highlights({
  matches,
  clips,
}: {
  matches: Match[];
  clips: PlaylistClip[];
}) {
  const { selectedTeamIds, isFiltering } = useTeamFilter();
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(true);

  const completed = useMemo(
    () =>
      matches
        .filter((m) => m.status === "FINISHED")
        .filter((m) =>
          isFiltering
            ? Array.from(selectedTeamIds).some((id) => matchInvolvesTeam(m, id))
            : true
        )
        .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()),
    [matches, isFiltering, selectedTeamIds]
  );

  const visible = showAll ? completed : completed.slice(0, HIGHLIGHTS_PAGE_SIZE);

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Highlights</h2>
        <span
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {completed.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No completed matches yet{isFiltering ? " for the selected teams" : ""}.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((m) => {
                  const matchClips = getClipsForMatch(clips, m);
                  const firstClipUrl =
                    matchClips.length > 0
                      ? `https://www.youtube.com/shorts/${matchClips[0].videoId}`
                      : null;

                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{formatMatchDate(m.utcDate)}</span>
                        <div className="flex items-center gap-2">
                          {firstClipUrl && (
                            <a
                              href={firstClipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-zinc-500 hover:underline dark:text-zinc-400"
                            >
                              {`⚽ ${matchClips.length} clip${matchClips.length !== 1 ? "s" : ""} ▶`}
                            </a>
                          )}
                          <a
                            href={highlightSearchUrl(m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-red-600 hover:underline"
                          >
                            Watch highlights ▶
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        <span className="flex items-center gap-1.5">
                          {m.homeTeam.crest && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.homeTeam.crest} alt="" className="h-5 w-5" />
                          )}
                          {m.homeTeam.shortName ?? m.homeTeam.name}
                        </span>
                        <span className="text-zinc-500">
                          {m.score.fullTime.home} – {m.score.fullTime.away}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {m.awayTeam.shortName ?? m.awayTeam.name}
                          {m.awayTeam.crest && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.awayTeam.crest} alt="" className="h-5 w-5" />
                          )}
                        </span>
                      </div>
                      {matchClips.length > 0 && (
                        <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                          {[...matchClips].reverse().map((clip) => (
                            <a
                              key={clip.videoId}
                              href={`https://www.youtube.com/shorts/${clip.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-1.5 text-xs text-zinc-500 hover:text-wc-maroon dark:text-zinc-400 dark:hover:text-wc-lavender"
                            >
                              <span className="mt-px flex-shrink-0">⚽</span>
                              <span className="line-clamp-1">{clip.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {completed.length > HIGHLIGHTS_PAGE_SIZE && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-4 text-sm font-medium text-wc-maroon hover:underline dark:text-wc-lavender"
                >
                  {showAll
                    ? "Show fewer"
                    : `Show ${completed.length - HIGHLIGHTS_PAGE_SIZE} more`}
                </button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
