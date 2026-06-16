"use client";

import { useMemo } from "react";
import type { GroupStanding } from "@/lib/types";
import { useTeamFilter } from "./TeamFilterContext";

export function GroupStandings({ standings }: { standings: GroupStanding[] }) {
  const { selectedTeamIds, isFiltering } = useTeamFilter();

  const visibleStandings = useMemo(() => {
    if (!isFiltering) return standings;
    return standings.filter((group) =>
      group.table.some((row) => row.team.id != null && selectedTeamIds.has(row.team.id))
    );
  }, [standings, isFiltering, selectedTeamIds]);

  if (visibleStandings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No standings to show for the selected teams.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleStandings.map((group) => (
        <div
          key={group.group}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {group.group}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                <th className="pb-1 pr-2 font-medium">Team</th>
                <th className="pb-1 px-1 text-center font-medium">P</th>
                <th className="pb-1 px-1 text-center font-medium">W</th>
                <th className="pb-1 px-1 text-center font-medium">D</th>
                <th className="pb-1 px-1 text-center font-medium">L</th>
                <th className="pb-1 px-1 text-center font-medium">GD</th>
                <th className="pb-1 pl-1 text-center font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.table.map((row) => {
                const highlighted = row.team.id != null && selectedTeamIds.has(row.team.id);
                return (
                  <tr
                    key={row.team.id ?? row.position}
                    className={`border-t border-zinc-100 dark:border-zinc-800 ${
                      highlighted ? "bg-blue-50 dark:bg-blue-950/40" : ""
                    }`}
                  >
                    <td className="py-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        {row.team.crest && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.team.crest} alt="" className="h-4 w-4" />
                        )}
                        <span className="truncate text-zinc-700 dark:text-zinc-300">
                          {row.team.shortName ?? row.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-center text-zinc-600 dark:text-zinc-400">{row.playedGames}</td>
                    <td className="text-center text-zinc-600 dark:text-zinc-400">{row.won}</td>
                    <td className="text-center text-zinc-600 dark:text-zinc-400">{row.draw}</td>
                    <td className="text-center text-zinc-600 dark:text-zinc-400">{row.lost}</td>
                    <td className="text-center text-zinc-600 dark:text-zinc-400">{row.goalDifference}</td>
                    <td className="text-center font-semibold text-zinc-900 dark:text-zinc-50">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
