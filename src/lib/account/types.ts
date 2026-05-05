import type { RecommendationDisplayItem } from "@/lib/recommendations/types";
import type {
  FavoriteDisplayItem,
  InquiryTypeValue,
  SavedBuildData,
} from "@/types";

export interface AccountContinuityPreferences {
  buildReminderOptIn: boolean;
  productUpdatesOptIn: boolean;
}

export interface AccountInquiryHistoryItem {
  id: string;
  type: InquiryTypeValue;
  typeLabel: string;
  title: string;
  messagePreview: string;
  createdAt: Date;
  href?: string;
}

export interface AccountDashboardStats {
  favoriteCount: number;
  savedBuildCount: number;
  recentlyViewedCount: number;
  inquiryCount: number;
}

export interface AccountDashboardData {
  favoriteItems: FavoriteDisplayItem[];
  savedBuilds: SavedBuildData[];
  recentBuilds: SavedBuildData[];
  recentlyViewed: RecommendationDisplayItem[];
  recommendedForYou: RecommendationDisplayItem[];
  basedOnFavorites: RecommendationDisplayItem[];
  inquiryHistory: AccountInquiryHistoryItem[];
  preferences: AccountContinuityPreferences;
  stats: AccountDashboardStats;
}

export interface AccountPreferencesActionState {
  success: boolean;
  message: string;
}
