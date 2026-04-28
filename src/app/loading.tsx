import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function RootLoading() {
  return (
    <RouteLoadingState
      eyebrow="Loading"
      title="Preparing the Tesla-inspired experience."
      description="We are pulling together product, account, and content context so the next page feels consistent and ready."
    />
  );
}
