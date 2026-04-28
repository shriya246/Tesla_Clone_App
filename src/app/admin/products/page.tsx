import {
  adminProductCategoryConfigs,
  getAdminProductCreateHref,
} from "@/lib/admin-products";
import { getAllAdminProducts } from "@/lib/db/admin";
import { hasCloudinaryEnv } from "@/lib/env";
import { ProductTable } from "@/components/admin/ProductTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

        <ProductTable
          config={adminProductCategoryConfigs.vehicles}
          items={products.vehicles}
        />
        <ProductTable
          config={adminProductCategoryConfigs.energy}
          items={products.energyProducts}
        />
        <ProductTable
          config={adminProductCategoryConfigs.shop}
          items={products.shopProducts}
        />
      </div>
    </section>
  );
}
