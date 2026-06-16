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
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {groupStageComplete ? "Knockout Bracket" : "Group Standings"}
      </h2>
      {groupStageComplete ? (
        <Bracket matches={matches} />
      ) : (
        <GroupStandings standings={standings} />
      )}
    </section>
  );
}
