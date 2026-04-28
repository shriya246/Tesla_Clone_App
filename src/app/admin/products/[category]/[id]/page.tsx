import { notFound } from "next/navigation";

import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import {
  getAdminProductCategoryConfig,
  isAdminProductCategory,
} from "@/lib/admin-products";
import { getAdminProductEditorData } from "@/lib/db/admin-products";
import { hasCloudinaryEnv } from "@/lib/env";

interface EditAdminProductPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export default async function EditAdminProductPage({
  params,
}: EditAdminProductPageProps) {
  const { category, id } = await params;

  if (!isAdminProductCategory(category)) {
    notFound();
  }

  const [categoryConfig, initialValues] = await Promise.all([
    Promise.resolve(getAdminProductCategoryConfig(category)),
    getAdminProductEditorData(category, id),
  ]);

  if (!initialValues) {
    notFound();
  }

  const publicHref = `${categoryConfig.publicBasePath}/${initialValues.slug}`;

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Edit {categoryConfig.categoryLabel}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Update {initialValues.title} without changing public routes.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            Adjust image sourcing, detail content, and CTA copy while keeping the
            existing product architecture stable for the live public pages.
          </p>
        </div>

        <AdminProductForm
          mode="edit"
          category={category}
          extraActions={
            <DeleteProductButton
              category={category}
              compact
              id={id}
              redirectTo="/admin/products"
              title={initialValues.title}
            />
          }
          initialValues={initialValues}
          isCloudinaryConfigured={hasCloudinaryEnv}
          productId={id}
          publicHref={publicHref}
        />
      </div>
    </section>
  );
}
