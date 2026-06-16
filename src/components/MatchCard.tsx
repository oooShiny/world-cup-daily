import type { Match } from "@/lib/types";
import { formatMatchDate, formatMatchTime, groupLabel, stageLabel } from "@/lib/format";

function TeamRow({
  name,
  crest,
  score,
  isWinner,
}: {
  name: string | null;
  crest: string | null;
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crest} alt="" className="h-5 w-5 flex-shrink-0" />
        ) : (
          <div className="h-5 w-5 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        )}
        <span
          className={`truncate text-sm ${
            isWinner ? "font-semibold text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {name ?? "TBD"}
        </span>
      </div>
      {score != null && (
        <span className={`text-sm font-semibold ${isWinner ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const { homeTeam, awayTeam, score, status, utcDate, group, stage } = match;
  const homeScore = score.fullTime.home;
  const awayScore = score.fullTime.away;
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const isFinished = status === "FINISHED";

  const label = groupLabel(group) ?? stageLabel(stage);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        {isLive ? (
          <span className="flex items-center gap-1 font-semibold text-red-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
            LIVE
          </span>
        ) : (
          <span>
            {formatMatchDate(utcDate)} &middot; {formatMatchTime(utcDate)}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <TeamRow
          name={homeTeam.shortName ?? homeTeam.name}
          crest={homeTeam.crest}
          score={isFinished || isLive ? homeScore : null}
          isWinner={isFinished && score.winner === "HOME_TEAM"}
        />
        <TeamRow
          name={awayTeam.shortName ?? awayTeam.name}
          crest={awayTeam.crest}
          score={isFinished || isLive ? awayScore : null}
          isWinner={isFinished && score.winner === "AWAY_TEAM"}
        />
      </div>
    </div>
  );
}
