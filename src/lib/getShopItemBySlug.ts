import { shopProducts } from "@/data/shop";

export function getShopItemBySlug(slug: string) {
  return shopProducts.find((product) => product.slug === slug);
}
