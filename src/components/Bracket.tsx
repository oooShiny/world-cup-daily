"use client";

import { useMemo } from "react";
import type { Match, Stage, Team } from "@/lib/types";
import { stageLabel } from "@/lib/format";
import { useTeamFilter } from "./TeamFilterContext";
import { matchInvolvesTeam } from "@/lib/teams";

// ── Layout constants ──────────────────────────────────────────────────────────
const CARD_H = 60;
const CARD_W = 210;
const COL_GAP = 40;   // space between right edge of card and left edge of next column
const PAIR_GAP = 4;   // gap between two matches that feed the same next-round match
const GROUP_GAP = 14; // gap between bracket groups (different next-round targets)
const LABEL_H = 26;   // height reserved above match cards for round label
const HALF_H = CARD_H / 2;

const MAIN_STAGES: Stage[] = ["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"];

const STAGE_COUNT: Partial<Record<Stage, number>> = {
  LAST_32: 16,
  LAST_16: 8,
  QUARTER_FINALS: 4,
  SEMI_FINALS: 2,
  FINAL: 1,
};

// ── Position computation ──────────────────────────────────────────────────────

function basePositions(count: number): number[] {
  const pairSlot = 2 * CARD_H + PAIR_GAP;
  const groupSlot = pairSlot + GROUP_GAP;
  return Array.from({ length: count }, (_, i) => {
    const pairIdx = Math.floor(i / 2);
    const posInPair = i % 2;
    return LABEL_H + pairIdx * groupSlot + posInPair * (CARD_H + PAIR_GAP);
  });
}

function nextRoundPositions(prevPositions: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < prevPositions.length; i += 2) {
    const topCenter = prevPositions[i] + HALF_H;
    const botCenter = prevPositions[i + 1] + HALF_H;
    result.push((topCenter + botCenter) / 2 - HALF_H);
  }
  return result;
}

function padToCount(arr: Match[], count: number): (Match | null)[] {
  const out: (Match | null)[] = arr.slice(0, count);
  while (out.length < count) out.push(null);
  return out;
}

// ── Bracket match card ────────────────────────────────────────────────────────

function BracketTeamRow({
  team,
  score,
  isWinner,
  isFiltered,
}: {
  team: Team | null;
  score: number | null;
  isWinner: boolean;
  isFiltered: boolean;
}) {
  return (
    <div
      className={`flex flex-1 items-center justify-between gap-1 px-2 ${
        isFiltered ? "opacity-40" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {team?.crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.crest} alt="" className="h-4 w-4 flex-shrink-0" />
        ) : (
          <div className="h-4 w-4 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        )}
        <span
          className={`truncate text-xs ${
            isWinner
              ? "font-semibold text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {team?.shortName ?? team?.name ?? "TBD"}
        </span>
      </div>
      {score !== null && (
        <span
          className={`flex-shrink-0 text-xs font-bold ${
            isWinner ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-600"
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function BracketCard({
  match,
  highlightTeamIds,
}: {
  match: Match | null;
  highlightTeamIds: Set<number>;
}) {
  if (!match) {
    return (
      <div
        className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/30"
        style={{ width: CARD_W, height: CARD_H }}
      />
    );
  }

  const { homeTeam, awayTeam, score, status } = match;
  const finished = status === "FINISHED";
  const live = status === "IN_PLAY" || status === "PAUSED";
  const showScore = finished || live;
  const homeScore = showScore ? score.fullTime.home : null;
  const awayScore = showScore ? score.fullTime.away : null;
  const homeWon = finished && score.winner === "HOME_TEAM";
  const awayWon = finished && score.winner === "AWAY_TEAM";

  const homeTeamObj: Team | null = homeTeam.name ? homeTeam : null;
  const awayTeamObj: Team | null = awayTeam.name ? awayTeam : null;

  const filtering = highlightTeamIds.size > 0;
  const homeFiltered = filtering && homeTeam.id != null && !highlightTeamIds.has(homeTeam.id);
  const awayFiltered = filtering && awayTeam.id != null && !highlightTeamIds.has(awayTeam.id);
  const matchHighlighted =
    filtering && (
      (homeTeam.id != null && highlightTeamIds.has(homeTeam.id)) ||
      (awayTeam.id != null && highlightTeamIds.has(awayTeam.id))
    );

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-md border bg-white dark:bg-zinc-900 ${
        matchHighlighted
          ? "border-wc-maroon dark:border-wc-lavender"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
      style={{ width: CARD_W, height: CARD_H }}
    >
      <BracketTeamRow
        team={homeTeamObj}
        score={homeScore}
        isWinner={homeWon}
        isFiltered={homeFiltered && !homeWon}
      />
      <div className="h-px flex-shrink-0 bg-zinc-100 dark:bg-zinc-800" />
      <BracketTeamRow
        team={awayTeamObj}
        score={awayScore}
        isWinner={awayWon}
        isFiltered={awayFiltered && !awayWon}
      />
      {live && (
        <div className="absolute right-1.5 top-1 flex items-center gap-0.5 text-[9px] font-semibold text-red-500">
          <span className="h-1 w-1 animate-pulse rounded-full bg-red-500" />
          LIVE
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Bracket({ matches }: { matches: Match[] }) {
  const { selectedTeamIds } = useTeamFilter();

  const { rounds, svgLines, totalWidth, totalHeight, thirdPlace } = useMemo(() => {
    // Separate by stage
    const byStage: Partial<Record<Stage, Match[]>> = {};
    for (const s of MAIN_STAGES) byStage[s] = [];
    let thirdPlace: Match | null = null;

    for (const m of matches) {
      if (m.stage === "THIRD_PLACE") {
        thirdPlace = m;
      } else if (MAIN_STAGES.includes(m.stage)) {
        byStage[m.stage]!.push(m);
      }
    }

    // Sort each stage by date
    for (const s of MAIN_STAGES) {
      byStage[s]!.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
    }

    // Only include stages that have matches in the API
    const activeStages = MAIN_STAGES.filter((s) => byStage[s]!.length > 0);

    if (activeStages.length === 0) {
      return { rounds: [], svgLines: [], totalWidth: 0, totalHeight: 0, thirdPlace };
    }

    // Pad each stage to its expected match count
    const paddedMatches = activeStages.map((s) =>
      padToCount(byStage[s]!, STAGE_COUNT[s] ?? byStage[s]!.length)
    );

    // Compute y-positions for each round
    const allPositions: number[][] = [];
    let pos = basePositions(paddedMatches[0].length);
    allPositions.push(pos);
    for (let i = 1; i < activeStages.length; i++) {
      pos = nextRoundPositions(pos);
      allPositions.push(pos);
    }

    // x-positions (left edge of each column)
    const colX = activeStages.map((_, i) => i * (CARD_W + COL_GAP));

    const totalWidth = colX[colX.length - 1] + CARD_W;
    const lastColPos = allPositions[0];
    const totalHeight = lastColPos[lastColPos.length - 1] + CARD_H + 4;

    // SVG connector lines between adjacent columns
    const svgLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let round = 0; round < activeStages.length - 1; round++) {
      const parentPos = allPositions[round];
      const childPos = allPositions[round + 1];
      const parentRight = colX[round] + CARD_W;
      const childLeft = colX[round + 1];
      const midX = parentRight + COL_GAP / 2;

      for (let ci = 0; ci < childPos.length; ci++) {
        const topCenter = parentPos[2 * ci] + HALF_H;
        const botCenter = parentPos[2 * ci + 1] + HALF_H;
        const childCenter = childPos[ci] + HALF_H;

        svgLines.push({ x1: parentRight, y1: topCenter, x2: midX, y2: topCenter });
        svgLines.push({ x1: parentRight, y1: botCenter, x2: midX, y2: botCenter });
        svgLines.push({ x1: midX, y1: topCenter, x2: midX, y2: botCenter });
        svgLines.push({ x1: midX, y1: childCenter, x2: childLeft, y2: childCenter });
      }
    }

    const rounds = activeStages.map((stage, i) => ({
      stage,
      matches: paddedMatches[i],
      positions: allPositions[i],
      x: colX[i],
    }));

    return { rounds, svgLines, totalWidth, totalHeight, thirdPlace };
  }, [matches]);

  if (rounds.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        The knockout bracket will appear once the group stage is complete.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      {/* Main bracket */}
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        {/* SVG connector lines */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={totalWidth}
          height={totalHeight}
          aria-hidden
        >
          {svgLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="stroke-zinc-200 dark:stroke-zinc-700"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Round labels and match cards */}
        {rounds.map(({ stage, matches: stageMatches, positions, x }) => (
          <div key={stage}>
            <div
              className="absolute top-0 truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500"
              style={{ left: x, width: CARD_W }}
            >
              {stageLabel(stage)}
            </div>
            {stageMatches.map((match, i) => (
              <div
                key={match?.id ?? `${stage}-${i}`}
                className="absolute"
                style={{ left: x, top: positions[i] }}
              >
                <BracketCard match={match} highlightTeamIds={selectedTeamIds} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Third place match */}
      {thirdPlace && (
        <div className="mt-8 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {stageLabel("THIRD_PLACE")}
          </div>
          <BracketCard match={thirdPlace} highlightTeamIds={selectedTeamIds} />
        </div>
      )}
    </div>
  );
}
