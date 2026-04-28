import "server-only";

import { FavoriteItemType, InquiryType } from "@prisma/client";

import {
  getAdminProductCategoryFromItemType,
  getAdminProductEditorHref,
  getProductHref,
} from "@/lib/admin-products";
import { isRemoteMediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import type {
  AdminDashboardSummary,
  AdminInquiryListItem,
  AdminProductCollection,
  AdminProductListItem,
  FavoriteItemTypeValue,
} from "@/types";

function buildMessagePreview(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();

  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117)}...`;
}

export async function getAllAdminProducts(): Promise<AdminProductCollection> {
  try {
    const [vehicles, energyProducts, shopProducts] = await Promise.all([
      prisma.vehicle.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          image: true,
          price: true,
          updatedAt: true,
        },
      }),
      prisma.energyProduct.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          image: true,
          updatedAt: true,
        },
      }),
      prisma.shopProduct.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          image: true,
          price: true,
          updatedAt: true,
        },
      }),
    ]);

    const mappedVehicles: AdminProductListItem[] = vehicles.map((vehicle) => ({
      id: vehicle.id,
      category: getAdminProductCategoryFromItemType("VEHICLE"),
      itemType: "VEHICLE",
      categoryLabel: "Vehicle",
      title: vehicle.title,
      slug: vehicle.slug,
      href: getProductHref("VEHICLE", vehicle.slug),
      adminHref: getAdminProductEditorHref(
        getAdminProductCategoryFromItemType("VEHICLE"),
        vehicle.id,
      ),
      summary: vehicle.subtitle,
      image: vehicle.image,
      isRemoteImage: isRemoteMediaUrl(vehicle.image),
      price: vehicle.price,
      updatedAt: vehicle.updatedAt,
    }));

    const mappedEnergyProducts: AdminProductListItem[] = energyProducts.map(
      (product) => ({
        id: product.id,
        category: getAdminProductCategoryFromItemType("ENERGY_PRODUCT"),
        itemType: "ENERGY_PRODUCT",
        categoryLabel: "Energy",
        title: product.title,
        slug: product.slug,
        href: getProductHref("ENERGY_PRODUCT", product.slug),
        adminHref: getAdminProductEditorHref(
          getAdminProductCategoryFromItemType("ENERGY_PRODUCT"),
          product.id,
        ),
        summary: product.description,
        image: product.image,
        isRemoteImage: isRemoteMediaUrl(product.image),
        updatedAt: product.updatedAt,
      }),
    );

    const mappedShopProducts: AdminProductListItem[] = shopProducts.map(
      (product) => ({
        id: product.id,
        category: getAdminProductCategoryFromItemType("SHOP_PRODUCT"),
        itemType: "SHOP_PRODUCT",
        categoryLabel: "Shop",
        title: product.title,
        slug: product.slug,
        href: getProductHref("SHOP_PRODUCT", product.slug),
        adminHref: getAdminProductEditorHref(
          getAdminProductCategoryFromItemType("SHOP_PRODUCT"),
          product.id,
        ),
        summary: product.description,
        image: product.image,
        isRemoteImage: isRemoteMediaUrl(product.image),
        price: product.price,
        updatedAt: product.updatedAt,
      }),
    );

    return {
      vehicles: mappedVehicles,
      energyProducts: mappedEnergyProducts,
      shopProducts: mappedShopProducts,
      totalCount:
        mappedVehicles.length +
        mappedEnergyProducts.length +
        mappedShopProducts.length,
    };
  } catch {
    return {
      vehicles: [],
      energyProducts: [],
      shopProducts: [],
      totalCount: 0,
    };
  }
}

export async function getAllInquiries(): Promise<AdminInquiryListItem[]> {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        productSlug: true,
        itemType: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return inquiries.map((inquiry) => ({
      id: inquiry.id,
      type: inquiry.type as InquiryType,
      itemType: inquiry.itemType ?? undefined,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      productSlug: inquiry.productSlug,
      message: inquiry.message,
      messagePreview: buildMessagePreview(inquiry.message),
      href:
        inquiry.productSlug && inquiry.itemType
          ? getProductHref(inquiry.itemType, inquiry.productSlug)
          : undefined,
      createdAt: inquiry.createdAt,
      userName: inquiry.user?.name,
      userEmail: inquiry.user?.email,
    }));
  } catch {
    return [];
  }
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  try {
    const [
      vehicleCount,
      energyCount,
      shopCount,
      inquiryCount,
      favoriteCount,
      userCount,
    ] = await prisma.$transaction([
      prisma.vehicle.count(),
      prisma.energyProduct.count(),
      prisma.shopProduct.count(),
      prisma.inquiry.count(),
      prisma.favorite.count(),
      prisma.user.count(),
    ]);

    return {
      vehicleCount,
      energyCount,
      shopCount,
      totalProducts: vehicleCount + energyCount + shopCount,
      inquiryCount,
      favoriteCount,
      userCount,
    };
  } catch {
    return {
      vehicleCount: 0,
      energyCount: 0,
      shopCount: 0,
      totalProducts: 0,
      inquiryCount: 0,
      favoriteCount: 0,
      userCount: 0,
    };
  }
}

export const adminInquiryTypeLabels: Record<InquiryType, string> = {
  VEHICLE_DEMO_REQUEST: "Vehicle Demo",
  PRODUCT_INQUIRY: "Product Inquiry",
  ENERGY_CONSULTATION: "Energy Consultation",
  GENERAL: "General Inquiry",
};

export const adminItemTypeLabels: Record<FavoriteItemType, string> = {
  VEHICLE: "Vehicle",
  ENERGY_PRODUCT: "Energy",
  SHOP_PRODUCT: "Shop",
};
