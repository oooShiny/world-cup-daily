"use client";

import { useMemo } from "react";
import type { Match, Stage } from "@/lib/types";
import { stageLabel } from "@/lib/format";
import { matchInvolvesTeam } from "@/lib/teams";
import { MatchCard } from "./MatchCard";
import { useTeamFilter } from "./TeamFilterContext";

const BRACKET_STAGES: Stage[] = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
];

export function Bracket({ matches }: { matches: Match[] }) {
  const { selectedTeamIds, isFiltering } = useTeamFilter();

  const stages = useMemo(() => {
    return BRACKET_STAGES.map((stage) => {
      const stageMatches = matches
        .filter((m) => m.stage === stage)
        .filter((m) =>
          isFiltering
            ? Array.from(selectedTeamIds).some((id) => matchInvolvesTeam(m, id))
            : true
        )
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
      return { stage, matches: stageMatches };
    }).filter((s) => s.matches.length > 0);
  }, [matches, isFiltering, selectedTeamIds]);

  if (stages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No knockout matches to show for the selected teams.
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map(({ stage, matches: stageMatches }) => (
        <div key={stage} className="min-w-[260px] flex-1">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {stageLabel(stage)}
          </h3>
          <div className="flex flex-col gap-3">
            {stageMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
