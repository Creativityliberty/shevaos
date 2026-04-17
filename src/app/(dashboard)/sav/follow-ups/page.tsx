import { getFollowUps } from "@/features/sav/actions/followup-actions";
import { FollowUpClient } from "./FollowUpClient";

export default async function FollowUpsPage() {
  const followUps = await getFollowUps();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <FollowUpClient initialFollowUps={followUps} />
    </div>
  );
}
