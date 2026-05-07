import "server-only";

import { AuditAction } from "@prisma/client";
import type { UserRole } from "@prisma/client";

import { recordAuditLogSafely } from "@/lib/audit";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductReference,
  updateAdminProduct,
} from "@/lib/db/admin-products";
import { publishEvent } from "@/lib/events";
import type { PersistedAdminProductInput } from "@/lib/validations/admin-product";
import type { AdminProductCategory, FavoriteItemTypeValue } from "@/types";

interface AdminActor {
  userId: string;
  email?: string | null;
  role?: UserRole | null;
}

interface ChangeAdminProductInput {
  actor: AdminActor;
  category: AdminProductCategory;
  input: PersistedAdminProductInput;
  id?: string;
}

function mapItemType(itemType: PersistedAdminProductInput["itemType"]): FavoriteItemTypeValue {
  return itemType;
}

export async function createAdminProductWithAutomation(
  input: ChangeAdminProductInput,
) {
  const createdProduct = await createAdminProduct(input.input);

  await publishEvent({
    type: "adminProduct.changed",
    actor: input.actor,
    entity: {
      type: "PRODUCT",
      id: createdProduct.id,
    },
    payload: {
      action: "created",
      adminUserId: input.actor.userId,
      category: createdProduct.category,
      itemType: mapItemType(createdProduct.itemType),
      productId: createdProduct.id,
      slug: createdProduct.slug,
    },
  });
  await recordAuditLogSafely({
    action: AuditAction.PRODUCT_CREATED,
    actor: input.actor,
    entity: {
      type: "PRODUCT",
      id: createdProduct.id,
    },
    message: `Created ${createdProduct.itemType} product ${createdProduct.slug}.`,
    metadata: {
      category: createdProduct.category,
      itemType: createdProduct.itemType,
      slug: createdProduct.slug,
    },
  });

  return createdProduct;
}

export async function updateAdminProductWithAutomation(
  input: ChangeAdminProductInput & {
    id: string;
  },
) {
  const existingProduct = await getAdminProductReference(input.category, input.id);
  const updatedProduct = await updateAdminProduct(input.category, input.id, input.input);

  await publishEvent({
    type: "adminProduct.changed",
    actor: input.actor,
    entity: {
      type: "PRODUCT",
      id: updatedProduct.id,
    },
    payload: {
      action: "updated",
      adminUserId: input.actor.userId,
      category: updatedProduct.category,
      itemType: mapItemType(updatedProduct.itemType),
      productId: updatedProduct.id,
      slug: updatedProduct.slug,
      previousSlug: existingProduct?.slug,
    },
  });
  await recordAuditLogSafely({
    action: AuditAction.PRODUCT_UPDATED,
    actor: input.actor,
    entity: {
      type: "PRODUCT",
      id: updatedProduct.id,
    },
    message: `Updated ${updatedProduct.itemType} product ${updatedProduct.slug}.`,
    metadata: {
      category: updatedProduct.category,
      itemType: updatedProduct.itemType,
      slug: updatedProduct.slug,
      previousSlug: existingProduct?.slug,
    },
  });

  return updatedProduct;
}

export async function deleteAdminProductWithAutomation(
  input: Pick<ChangeAdminProductInput, "actor" | "category"> & {
    id: string;
  },
) {
  const deletedProduct = await deleteAdminProduct(input.category, input.id);

  await publishEvent({
    type: "adminProduct.changed",
    actor: input.actor,
    entity: {
      type: "PRODUCT",
      id: deletedProduct.id,
    },
    payload: {
      action: "deleted",
      adminUserId: input.actor.userId,
      category: deletedProduct.category,
      itemType: mapItemType(deletedProduct.itemType),
      productId: deletedProduct.id,
      slug: deletedProduct.slug,
    },
  });
  await recordAuditLogSafely({
    action: AuditAction.PRODUCT_DELETED,
    actor: input.actor,
    entity: {
      type: "PRODUCT",
      id: deletedProduct.id,
    },
    message: `Deleted ${deletedProduct.itemType} product ${deletedProduct.slug}.`,
    metadata: {
      category: deletedProduct.category,
      itemType: deletedProduct.itemType,
      slug: deletedProduct.slug,
    },
  });

  return deletedProduct;
}
