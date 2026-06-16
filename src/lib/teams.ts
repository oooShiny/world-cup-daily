import type { Match, GroupStanding, Team } from "./types";

export function collectTeams(matches: Match[], standings: GroupStanding[]): Team[] {
  const byId = new Map<number, Team>();

  for (const standing of standings) {
    for (const row of standing.table) {
      if (row.team.id != null) byId.set(row.team.id, row.team);
    }
  }

  for (const match of matches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (team.id != null && !byId.has(team.id)) byId.set(team.id, team);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "")
  );
}

export function matchInvolvesTeam(match: Match, teamId: number): boolean {
  return match.homeTeam.id === teamId || match.awayTeam.id === teamId;
}
