import "server-only";

import { FavoriteItemType, InquiryPriority, InquiryStatus, InquiryType } from "@prisma/client";

import {
  getAdminProductCatalogBase,
  getProductPopularityIndex,
  groupAdminProductCollection,
  mergeAdminProductEngagement,
} from "@/lib/admin-insights";
import {
  adminInquiryPriorityLabels,
  adminInquiryStatusLabels,
  adminInquiryTypeLabels,
  adminItemTypeLabels,
  adminUserIntentLevelLabels,
  formatOperationalTagLabel,
} from "@/lib/admin-labels";
import { getProductHref } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import type {
  AdminDashboardSummary,
  AdminInquiryDetailItem,
  AdminInquiryListItem,
  AdminInquiryWorkflowSummary,
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
        status: true,
        priority: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        productSlug: true,
        itemType: true,
        operationalTags: true,
        lastAutomatedAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            intentLevel: true,
            recommendationEligible: true,
          },
        },
      },
    });

    return inquiries.map((inquiry) => ({
      id: inquiry.id,
      type: inquiry.type as InquiryType,
      status: inquiry.status,
      priority: inquiry.priority,
      itemType: inquiry.itemType ?? undefined,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      productSlug: inquiry.productSlug,
      message: inquiry.message,
      messagePreview: buildMessagePreview(inquiry.message),
      operationalTags: inquiry.operationalTags,
      lastAutomatedAt: inquiry.lastAutomatedAt,
      userIntentLevel: inquiry.user?.intentLevel,
      recommendationEligible: inquiry.user?.recommendationEligible ?? false,
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
        status: true,
        priority: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        productSlug: true,
        itemType: true,
        operationalTags: true,
        lastAutomatedAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            intentLevel: true,
            recommendationEligible: true,
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
      status: inquiry.status,
      priority: inquiry.priority,
      itemType: inquiry.itemType ?? undefined,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      productSlug: inquiry.productSlug,
      message: inquiry.message,
      messagePreview: buildMessagePreview(inquiry.message),
      operationalTags: inquiry.operationalTags,
      lastAutomatedAt: inquiry.lastAutomatedAt,
      userIntentLevel: inquiry.user?.intentLevel,
      recommendationEligible: inquiry.user?.recommendationEligible ?? false,
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

export async function getInquiryWorkflowSummary(): Promise<AdminInquiryWorkflowSummary> {
  try {
    const [prioritizedCount, highPriorityCount, urgentCount] =
      await prisma.$transaction([
        prisma.inquiry.count({
          where: {
            status: InquiryStatus.PRIORITIZED,
          },
        }),
        prisma.inquiry.count({
          where: {
            priority: InquiryPriority.HIGH,
          },
        }),
        prisma.inquiry.count({
          where: {
            priority: InquiryPriority.URGENT,
          },
        }),
      ]);

    return {
      prioritizedCount,
      highPriorityCount,
      urgentCount,
    };
  } catch {
    return {
      prioritizedCount: 0,
      highPriorityCount: 0,
      urgentCount: 0,
    };
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

export {
  adminInquiryPriorityLabels,
  adminInquiryStatusLabels,
  adminInquiryTypeLabels,
  adminItemTypeLabels,
  adminUserIntentLevelLabels,
  formatOperationalTagLabel,
};
