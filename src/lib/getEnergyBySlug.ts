import { energyProducts } from "@/data/energy";

export function getEnergyBySlug(slug: string) {
  return energyProducts.find((product) => product.slug === slug);
}
