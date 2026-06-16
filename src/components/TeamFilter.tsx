"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
import { useTeamFilter } from "./TeamFilterContext";

export function TeamFilter({ teams }: { teams: Team[] }) {
  const { selectedTeamIds, toggleTeam, clearFilter, isFiltering } = useTeamFilter();
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3 select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filter by team
          </h2>
          {isFiltering && (
            <span className="rounded-full bg-wc-maroon px-2 py-0.5 text-xs font-semibold text-white">
              {selectedTeamIds.size}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isFiltering && (
            <button
              onClick={(e) => { e.stopPropagation(); clearFilter(); }}
              className="text-sm font-medium text-wc-maroon hover:underline dark:text-wc-lavender"
            >
              Clear
            </button>
          )}
          <svg
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => {
              if (team.id == null) return null;
              const selected = selectedTeamIds.has(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id as number)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                    selected
                      ? "border-wc-maroon bg-wc-maroon text-white"
                      : "border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-wc-maroon dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {team.crest && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={team.crest} alt="" className="h-4 w-4" />
                  )}
                  {team.shortName ?? team.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
