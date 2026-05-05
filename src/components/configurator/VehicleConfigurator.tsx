"use client";

import Link from "next/link";
import { useState } from "react";

import { BuildSummary } from "@/components/configurator/BuildSummary";
import { OptionSelector } from "@/components/configurator/OptionSelector";
import { SaveBuildButton } from "@/components/configurator/SaveBuildButton";
import { resolveVehicleConfiguratorState } from "@/lib/configurator/vehicle-configurator";
import type {
  VehicleBuildSelectionIds,
  VehicleConfiguratorDefinition,
} from "@/types";

interface VehicleConfiguratorProps {
  definition: VehicleConfiguratorDefinition;
  initialSelectionIds: VehicleBuildSelectionIds;
  initialBuildLabel?: string;
  isSignedIn: boolean;
  signInHref: string;
  loadedBuildHref?: string;
}

export function VehicleConfigurator({
  definition,
  initialSelectionIds,
  initialBuildLabel,
  isSignedIn,
  signInHref,
  loadedBuildHref,
}: VehicleConfiguratorProps) {
  const [selectionIds, setSelectionIds] =
    useState<VehicleBuildSelectionIds>(initialSelectionIds);
  const [buildLabel, setBuildLabel] = useState(initialBuildLabel ?? "");
  const summary = resolveVehicleConfiguratorState(definition, selectionIds);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
      <div className="space-y-6">
        {definition.groups.map((group) => (
          <OptionSelector
            key={group.key}
            group={group}
            selectedOptionId={selectionIds[group.key]}
            onChange={(optionId) =>
              setSelectionIds((current) => ({
                ...current,
                [group.key]: optionId,
              }))
            }
          />
        ))}
      </div>

      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <BuildSummary
          title={definition.vehicleTitle}
          subtitle="Review the current configuration snapshot, keep a named build if you want, and save it to revisit later."
          vehiclePrice={definition.vehiclePrice}
          estimatedPrice={summary.estimatedPrice}
          selectedOptions={summary.selectedOptions}
          buildLabel={buildLabel || undefined}
          meta={loadedBuildHref ? "Loaded from a saved build" : undefined}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/50"
                htmlFor="build-label"
              >
                Build Name <span className="text-white/28">(optional)</span>
              </label>
              <input
                id="build-label"
                type="text"
                value={buildLabel}
                maxLength={80}
                placeholder="Weekend Range Build"
                className="w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onChange={(event) => setBuildLabel(event.target.value)}
              />
            </div>

            <SaveBuildButton
              buildLabel={buildLabel}
              isSignedIn={isSignedIn}
              saveLabel={loadedBuildHref ? "Save as New Build" : "Save Build"}
              selectionIds={summary.selectionIds}
              signInHref={signInHref}
              vehicleSlug={definition.vehicleSlug}
            />

            <div className="rounded-[1.5rem] border border-white/10 bg-black/24 px-5 py-4 text-sm leading-6 text-white/62">
              Saved builds capture this configuration snapshot so you can return
              to it from your account later.
              {loadedBuildHref ? (
                <div className="mt-4">
                  <Link
                    href={loadedBuildHref}
                    className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                  >
                    Open Original Saved Build
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </BuildSummary>
      </div>
    </div>
  );
}
