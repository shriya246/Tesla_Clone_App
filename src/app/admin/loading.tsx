import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function AdminLoading() {
  return (
    <RouteLoadingState
      eyebrow="Admin"
      title="Loading the admin workspace."
      description="We are preparing catalog and inquiry data so the operational view stays consistent with the rest of the app."
    />
  );
}
