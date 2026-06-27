"use client";

import { useState } from "react";
import type { GroupStanding, Match } from "@/lib/types";
import { GroupStandings } from "./GroupStandings";
import { Bracket } from "./Bracket";

export function StandingsSection({
  standings,
  matches,
  groupStageComplete,
}: {
  standings: GroupStanding[];
  matches: Match[];
  groupStageComplete: boolean;
}) {
  const [open, setOpen] = useState(true);
  const title = groupStageComplete ? "Knockout Bracket" : "Group Standings";

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <span
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (groupStageComplete ? <Bracket matches={matches} /> : <GroupStandings standings={standings} />)}
    </section>
  );
}
