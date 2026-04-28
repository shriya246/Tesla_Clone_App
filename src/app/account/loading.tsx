import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function AccountLoading() {
  return (
    <RouteLoadingState
      eyebrow="Account"
      title="Loading your saved Tesla-inspired catalog."
      description="We are gathering your account session and saved items so the profile view is ready when it appears."
    />
  );
}
