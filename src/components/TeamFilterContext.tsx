"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface TeamFilterContextValue {
  selectedTeamIds: Set<number>;
  toggleTeam: (teamId: number) => void;
  clearFilter: () => void;
  isFiltering: boolean;
}

const TeamFilterContext = createContext<TeamFilterContextValue | null>(null);

export function TeamFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<number>>(new Set());

  const value = useMemo<TeamFilterContextValue>(
    () => ({
      selectedTeamIds,
      toggleTeam: (teamId: number) => {
        setSelectedTeamIds((prev) => {
          const next = new Set(prev);
          if (next.has(teamId)) next.delete(teamId);
          else next.add(teamId);
          return next;
        });
      },
      clearFilter: () => setSelectedTeamIds(new Set()),
      isFiltering: selectedTeamIds.size > 0,
    }),
    [selectedTeamIds]
  );

  return <TeamFilterContext.Provider value={value}>{children}</TeamFilterContext.Provider>;
}

export function useTeamFilter(): TeamFilterContextValue {
  const ctx = useContext(TeamFilterContext);
  if (!ctx) throw new Error("useTeamFilter must be used within a TeamFilterProvider");
  return ctx;
}
