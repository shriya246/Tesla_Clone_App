import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function SavedBuildDetailLoading() {
  return (
    <RouteLoadingState
      eyebrow="Saved Build Detail"
      title="Loading your saved build snapshot."
      description="We are assembling the selected options, comparison context, and continue-build actions for this configuration."
    />
  );
}
