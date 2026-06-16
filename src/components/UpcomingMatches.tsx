"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/lib/types";
import { isSameLocalDay, formatMatchDate } from "@/lib/format";
import { matchInvolvesTeam } from "@/lib/teams";
import { MatchCard } from "./MatchCard";
import { useTeamFilter } from "./TeamFilterContext";

const UPCOMING_PAGE_SIZE = 6;

export function UpcomingMatches({ matches, now }: { matches: Match[]; now: string }) {
  const { selectedTeamIds, isFiltering } = useTeamFilter();
  const [showAll, setShowAll] = useState(false);

  const reference = useMemo(() => new Date(now), [now]);

  const upcoming = useMemo(
    () =>
      matches
        .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED" || m.status === "IN_PLAY" || m.status === "PAUSED")
        .filter((m) =>
          isFiltering
            ? Array.from(selectedTeamIds).some((id) => matchInvolvesTeam(m, id))
            : true
        )
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()),
    [matches, isFiltering, selectedTeamIds]
  );

  const todaysMatches = useMemo(
    () => upcoming.filter((m) => isSameLocalDay(m.utcDate, reference)),
    [upcoming, reference]
  );

  const laterMatches = useMemo(
    () => upcoming.filter((m) => !isSameLocalDay(m.utcDate, reference)),
    [upcoming, reference]
  );

  const visibleLater = showAll ? laterMatches : laterMatches.slice(0, UPCOMING_PAGE_SIZE);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Today&apos;s Matches
      </h2>
      {todaysMatches.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No matches scheduled for today{isFiltering ? " for the selected teams" : ""}.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {todaysMatches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      {laterMatches.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Upcoming
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLater.map((m) => (
              <div key={m.id} className="relative">
                <span className="absolute -top-2 left-3 z-10 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {formatMatchDate(m.utcDate)}
                </span>
                <MatchCard match={m} />
              </div>
            ))}
          </div>
          {laterMatches.length > UPCOMING_PAGE_SIZE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {showAll ? "Show fewer" : `Show ${laterMatches.length - UPCOMING_PAGE_SIZE} more`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
