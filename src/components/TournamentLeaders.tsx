"use client";

import { useState } from "react";
import type { ScorerEntry } from "@/lib/types";

export function TournamentLeaders({ scorers }: { scorers: ScorerEntry[] }) {
  const [open, setOpen] = useState(true);

  if (scorers.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tournament Leaders
        </h2>
        <span
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pl-4 pr-2 font-medium">#</th>
                <th className="py-2 pr-2 font-medium">Player</th>
                <th className="py-2 pr-2 font-medium">Team</th>
                <th className="py-2 px-2 text-center font-medium" title="Goals">G</th>
                <th className="py-2 pl-2 pr-4 text-center font-medium" title="Assists">A</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((entry, i) => (
                <tr
                  key={entry.player.id}
                  className="border-t border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-2 pl-4 pr-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {i + 1}
                  </td>
                  <td className="py-2 pr-2 font-medium text-zinc-900 dark:text-zinc-50">
                    {entry.player.name}
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1.5">
                      {entry.team.crest && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.team.crest} alt="" className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {entry.team.shortName ?? entry.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-semibold text-zinc-900 dark:text-zinc-50">
                    {entry.goals}
                  </td>
                  <td className="py-2 pl-2 pr-4 text-center text-zinc-500 dark:text-zinc-400">
                    {entry.assists ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
