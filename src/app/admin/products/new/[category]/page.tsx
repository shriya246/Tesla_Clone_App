import { notFound } from "next/navigation";

import { AdminProductForm } from "@/components/admin/AdminProductForm";
import {
  getAdminProductCategoryConfig,
  isAdminProductCategory,
} from "@/lib/admin-products";
import { getAdminProductCreateDefaults } from "@/lib/db/admin-products";
import { hasCloudinaryEnv } from "@/lib/env";

interface NewAdminProductPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function NewAdminProductPage({
  params,
}: NewAdminProductPageProps) {
  const { category } = await params;

  if (!isAdminProductCategory(category)) {
    notFound();
  }

  const categoryConfig = getAdminProductCategoryConfig(category);
  const initialValues = getAdminProductCreateDefaults(category);

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Create {categoryConfig.categoryLabel}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Add a new {categoryConfig.categoryLabel.toLowerCase()} with media-ready data.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            This form keeps the current public routes stable while letting you move
            product imagery off placeholder assets and into real stored URLs.
          </p>
        </div>

        <AdminProductForm
          mode="create"
          category={category}
          initialValues={initialValues}
          isCloudinaryConfigured={hasCloudinaryEnv}
        />
      </div>
    </section>
  );
}
