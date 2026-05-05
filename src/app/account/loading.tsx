import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function AccountLoading() {
  return (
    <RouteLoadingState
      eyebrow="Account"
      title="Loading your Tesla-inspired account dashboard."
      description="We are gathering your continuity data, saved builds, recent views, recommendations, and account preferences so the dashboard is ready when it appears."
    />
  );
}
