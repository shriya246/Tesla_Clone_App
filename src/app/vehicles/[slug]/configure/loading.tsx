import { RouteLoadingState } from "@/components/RouteLoadingState";

export default function ConfigureVehicleLoading() {
  return (
    <RouteLoadingState
      eyebrow="Vehicle Configurator"
      title="Loading your configuration workspace."
      description="We are gathering the selected vehicle, saved build continuity, and option set so the configurator is ready when it appears."
    />
  );
}
