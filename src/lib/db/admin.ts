import "server-only";

import { FavoriteItemType, InquiryType } from "@prisma/client";

import {
  getAdminProductCatalogBase,
  getProductPopularityIndex,
  groupAdminProductCollection,
  mergeAdminProductEngagement,
} from "@/lib/admin-insights";
import {
  adminInquiryTypeLabels,
  adminItemTypeLabels,
} from "@/lib/admin-labels";
import { getProductHref } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import type {
  AdminDashboardSummary,
  AdminInquiryDetailItem,
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
    const [catalogBase, engagementIndex] = await Promise.all([
      getAdminProductCatalogBase(),
      getProductPopularityIndex(),
    ]);

    return groupAdminProductCollection(
      mergeAdminProductEngagement(catalogBase, engagementIndex),
    );
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
      adminHref: `/admin/inquiries/${inquiry.id}`,
      createdAt: inquiry.createdAt,
      userName: inquiry.user?.name,
      userEmail: inquiry.user?.email,
    }));
  } catch {
    return [];
  }
}

export async function getInquiryById(
  id: string,
): Promise<AdminInquiryDetailItem | null> {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: {
        id,
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

    if (!inquiry) {
      return null;
    }

    return {
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
      adminHref: `/admin/inquiries/${inquiry.id}`,
      createdAt: inquiry.createdAt,
      userName: inquiry.user?.name,
      userEmail: inquiry.user?.email,
    };
  } catch {
    return null;
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
      savedBuildCount,
      searchEventCount,
      recentlyViewedCount,
      userCount,
    ] = await prisma.$transaction([
      prisma.vehicle.count(),
      prisma.energyProduct.count(),
      prisma.shopProduct.count(),
      prisma.inquiry.count(),
      prisma.favorite.count(),
      prisma.savedBuild.count(),
      prisma.searchEvent.count(),
      prisma.recentlyViewed.count(),
      prisma.user.count(),
    ]);

    return {
      vehicleCount,
      energyCount,
      shopCount,
      totalProducts: vehicleCount + energyCount + shopCount,
      inquiryCount,
      favoriteCount,
      savedBuildCount,
      searchEventCount,
      recentlyViewedCount,
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
      savedBuildCount: 0,
      searchEventCount: 0,
      recentlyViewedCount: 0,
      userCount: 0,
    };
  }
}

export { adminInquiryTypeLabels, adminItemTypeLabels };
