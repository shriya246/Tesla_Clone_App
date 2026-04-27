import { vehicleLineup } from "@/data/vehicles";

export function getVehicleBySlug(slug: string) {
  return vehicleLineup.find((vehicle) => vehicle.slug === slug);
}
