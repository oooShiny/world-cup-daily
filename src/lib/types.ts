export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export type Stage =
  | "GROUP_STAGE"
  | "LAST_32"
  | "LAST_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "THIRD_PLACE"
  | "FINAL";

export interface Team {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface Score {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: Stage;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

export interface StandingsRow {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GroupStanding {
  stage: string;
  type: string;
  group: string;
  table: StandingsRow[];
}

export interface ScorerEntry {
  player: {
    id: number;
    name: string;
    nationality: string | null;
  };
  team: Team;
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface PlaylistClip {
  videoId: string;
  title: string;
  matchDesc: string | null;
  matchDate: string | null;
}

export interface TournamentData {
  matches: Match[];
  standings: GroupStanding[];
  groupStageComplete: boolean;
  scorers: ScorerEntry[];
}
