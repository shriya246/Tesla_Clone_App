import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function AccountBuildsLoading() {
  return (
    <RouteLoadingState
      eyebrow="Saved Builds"
      title="Loading your saved build continuity."
      description="We are gathering recent configuration snapshots and resume links so the builds dashboard is ready when it appears."
    />
  );
}
