export type Platform = "all" | "android" | "ios";

export type TimePeriod =
  | "today"
  | "yesterday"
  | "last_7"
  | "last_15"
  | "last_30"
  | "custom";

export type Sentiment = "positive" | "negative" | "neutral" | "uncategorized";

export interface FilterState {
  platform: Platform;
  timePeriod: TimePeriod;
  customDateFrom: string | null;
  customDateTo: string | null;
  appId: string | null;
}

export interface App {
  id: string;
  name: string;
  android_bundle_id: string;
  ios_bundle_id: string;
  last_android_sync: string | null;
  last_ios_sync: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  app_id: string;
  platform_review_id: string;
  platform: "android" | "ios";
  author_name: string;
  star_rating: number;
  review_text: string;
  sanitized_text: string;
  sentiment: Sentiment;
  device_info: string | null;
  app_version: string | null;
  os_version: string | null;
  upvote_count: number | null;
  review_date: string;
  ingested_at: string;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ReviewCategory {
  review_id: string;
  category_id: string;
}

export interface AIReply {
  id: string;
  review_id: string;
  tone: "empathetic" | "professional" | "gratitude";
  reply_text: string;
  created_at: string;
}

export interface WeeklyPulse {
  id: string;
  app_id: string;
  pulse_content: string;
  themes: { name: string; count: number }[];
  quotes: string[];
  action_ideas: string[];
  status: "draft" | "approved" | "rejected";
  generated_at: string;
  approved_at: string | null;
}

export interface FeeExplainer {
  id: string;
  scenario: string;
  bullets: string[];
  source_links: string[];
  status: "draft" | "approved" | "rejected";
  last_checked: string;
  generated_at: string;
}

export interface SyncLog {
  id: string;
  app_id: string;
  platform: "android" | "ios";
  status: "running" | "success" | "failed";
  reviews_fetched: number;
  error_message: string | null;
  retry_count: number;
  started_at: string;
  completed_at: string | null;
}
