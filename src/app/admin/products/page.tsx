import Link from "next/link";

import {
  adminProductCategoryConfigs,
  getAdminProductCreateHref,
} from "@/lib/admin-products";
import { getAllAdminProducts } from "@/lib/db/admin";
import { hasCloudinaryEnv } from "@/lib/env";
import { formatDateTime } from "@/lib/format-date";
import { buildMediaBackgroundStyle } from "@/lib/media";
import type { AdminProductListItem } from "@/types";

export const dynamic = "force-dynamic";

function ProductGroup({
  createCategory,
  createLabel,
  title,
  description,
  items,
}: {
  createCategory: "vehicles" | "energy" | "shop";
  createLabel: string;
  title: string;
  description: string;
  items: AdminProductListItem[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            {title}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/72">
            {items.length} items
          </span>
          <Link
            href={getAdminProductCreateHref(createCategory)}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white text-sm font-medium text-slate-950 transition hover:bg-white/90"
          >
            New {createLabel}
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
          <p className="text-lg font-medium text-white">Nothing here yet.</p>
          <p className="mt-3 text-sm leading-6 text-white/62">
            This product group will appear once items are available in the database.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div
                  className="h-44 rounded-[1.4rem] border border-white/10"
                  style={buildMediaBackgroundStyle({
                    image: item.image,
                    overlay:
                      "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.62))",
                    backgroundColor: "#0c0f15",
                  })}
                />

                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                        {item.categoryLabel}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/56">{item.slug}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      {item.price ? (
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/58">
                          {item.price}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/38">
                        Updated {formatDateTime(item.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/78">
                      {item.isRemoteImage ? "Remote image" : "Local asset"}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-white/72 sm:text-base">
                    {item.summary}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={item.href}
                      className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                    >
                      View public page
                    </Link>
                    <Link
                      href={item.adminHref}
                      className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-5 text-sm font-medium text-white/68 transition hover:border-white/18 hover:text-white"
                    >
                      Edit product
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function AdminProductsPage() {
  const products = await getAllAdminProducts();

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Products
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Catalog media and product data, ready for real uploads.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            Manage product image URLs, open the new create and edit flows, and
            keep the existing public routes stable while product media moves from
            placeholder assets toward production-style storage.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/72">
              {products.totalCount} total products
            </div>
            <div
              className={`inline-flex rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] ${
                hasCloudinaryEnv
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "border-amber-300/20 bg-amber-300/10 text-amber-100"
              }`}
            >
              {hasCloudinaryEnv
                ? "Cloudinary upload enabled"
                : "Manual URL mode until Cloudinary env is set"}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {Object.values(adminProductCategoryConfigs).map((config) => (
              <Link
                key={config.category}
                href={getAdminProductCreateHref(config.category)}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white text-sm font-medium text-slate-950 transition hover:bg-white/90"
              >
                New {config.categoryLabel}
              </Link>
            ))}
          </div>
        </div>

        <ProductGroup
          createCategory="vehicles"
          createLabel="Vehicle"
          title="Vehicles"
          description={adminProductCategoryConfigs.vehicles.collectionDescription}
          items={products.vehicles}
        />
        <ProductGroup
          createCategory="energy"
          createLabel="Energy Product"
          title="Energy"
          description={adminProductCategoryConfigs.energy.collectionDescription}
          items={products.energyProducts}
        />
        <ProductGroup
          createCategory="shop"
          createLabel="Shop Product"
          title="Shop"
          description={adminProductCategoryConfigs.shop.collectionDescription}
          items={products.shopProducts}
        />
      </div>
    </section>
  );
}
