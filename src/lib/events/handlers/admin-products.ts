import { getProductHref } from "@/lib/admin-products";
import { revalidateProductMutationCache } from "@/lib/cache";
import type { AppEvent, EventHandler } from "@/lib/events/types";

function collectProductPaths(event: AppEvent<"adminProduct.changed">) {
  const currentHref = getProductHref(event.payload.itemType, event.payload.slug);
  const listingPath = `/${currentHref.split("/")[1]}`;
  const paths = new Set<string>([
    "/admin",
    "/admin/products",
    "/admin/insights",
    "/search",
    "/account",
    listingPath,
    currentHref,
  ]);

  if (event.payload.previousSlug && event.payload.previousSlug !== event.payload.slug) {
    paths.add(getProductHref(event.payload.itemType, event.payload.previousSlug));
  }

  return [...paths];
}

async function revalidateProductSurfaces(event: AppEvent<"adminProduct.changed">) {
  const paths = collectProductPaths(event);
  const revalidated = revalidateProductMutationCache({
    itemType: event.payload.itemType,
    paths,
  });

  return {
    message: `Revalidated ${revalidated.paths.length} product/admin paths and ${revalidated.tags.length} cache tags after the ${event.payload.action} action.`,
    metadata: {
      action: event.payload.action,
      paths: revalidated.paths,
      tags: revalidated.tags,
    },
  };
}

export const adminProductChangedHandlers: EventHandler<"adminProduct.changed">[] = [
  {
    id: "revalidate-product-surfaces",
    handle: revalidateProductSurfaces,
  },
];
