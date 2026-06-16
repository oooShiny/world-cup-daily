import type { GroupStanding, Match, TournamentData } from "./types";

const BASE_URL = process.env.FOOTBALL_DATA_API_BASE ?? "https://api.football-data.org/v4";
const COMPETITION_CODE = process.env.WORLD_CUP_COMPETITION_CODE ?? "WC";
const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

// Cache responses for 60 seconds to stay within football-data.org rate limits.
const REVALIDATE_SECONDS = 60;

async function footballDataFetch<T>(path: string): Promise<T> {
  if (!API_TOKEN) {
    throw new Error(
      "Missing FOOTBALL_DATA_API_TOKEN. Set it in .env.local to fetch live World Cup data."
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": API_TOKEN },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `football-data.org request failed (${res.status} ${res.statusText}): ${body}`
    );
  }

  return res.json() as Promise<T>;
}

export async function getMatches(): Promise<Match[]> {
  const data = await footballDataFetch<{ matches: Match[] }>(
    `/competitions/${COMPETITION_CODE}/matches`
  );
  return data.matches;
}

export async function getStandings(): Promise<GroupStanding[]> {
  const data = await footballDataFetch<{ standings: GroupStanding[] }>(
    `/competitions/${COMPETITION_CODE}/standings`
  );
  return data.standings.filter((s) => s.type === "TOTAL" && s.group);
}

export async function getTournamentData(): Promise<TournamentData> {
  const [matches, standings] = await Promise.all([getMatches(), getStandings()]);

  const groupStageMatches = matches.filter((m) => m.stage === "GROUP_STAGE");
  const groupStageComplete =
    groupStageMatches.length > 0 &&
    groupStageMatches.every((m) => m.status === "FINISHED");

  return { matches, standings, groupStageComplete };
}
