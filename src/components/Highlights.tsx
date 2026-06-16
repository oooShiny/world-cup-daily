"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/lib/types";
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

export function Highlights({ matches }: { matches: Match[] }) {
  const { selectedTeamIds, isFiltering } = useTeamFilter();
  const [showAll, setShowAll] = useState(false);

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
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Highlights</h2>
      {completed.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No completed matches yet{isFiltering ? " for the selected teams" : ""}.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => (
              <a
                key={m.id}
                href={highlightSearchUrl(m)}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-wc-maroon dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{formatMatchDate(m.utcDate)}</span>
                  <span className="font-medium text-red-600 group-hover:underline">
                    Watch highlights ▶
                  </span>
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
              </a>
            ))}
          </div>
          {completed.length > HIGHLIGHTS_PAGE_SIZE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 text-sm font-medium text-wc-maroon hover:underline dark:text-wc-lavender"
            >
              {showAll ? "Show fewer" : `Show ${completed.length - HIGHLIGHTS_PAGE_SIZE} more`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
