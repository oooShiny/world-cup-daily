import { getTournamentData } from "@/lib/footballData";
import { collectTeams } from "@/lib/teams";
import { TeamFilterProvider } from "@/components/TeamFilterContext";
import { TeamFilter } from "@/components/TeamFilter";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { StandingsSection } from "@/components/StandingsSection";
import { Highlights } from "@/components/Highlights";

export const revalidate = 60;

export default async function Home() {
  let data;
  let error: string | null = null;

  try {
    data = await getTournamentData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load tournament data.";
  }

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          2026 World Cup Daily
        </h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      </main>
    );
  }

  const { matches, standings, groupStageComplete } = data;
  const teams = collectTeams(matches, standings);
  const now = new Date().toISOString();

  return (
    <TeamFilterProvider>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <header>
          <h1 className="text-4xl font-black tracking-tight text-wc-maroon dark:text-wc-lavender">
            2026 World Cup Daily
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Live scores, standings, and highlights for the FIFA World Cup 2026.
          </p>
        </header>

        <TeamFilter teams={teams} />
        <UpcomingMatches matches={matches} now={now} />
        <StandingsSection
          standings={standings}
          matches={matches}
          groupStageComplete={groupStageComplete}
        />
        <Highlights matches={matches} />
      </main>
    </TeamFilterProvider>
  );
}
