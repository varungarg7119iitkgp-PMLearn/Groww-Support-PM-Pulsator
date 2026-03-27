import {
  Star,
  BarChart3,
  Tags,
  Cloud,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface MobileNavTab extends NavTab {
  children?: NavTab[];
}

export const NAV_TABS: NavTab[] = [
  { id: "reviews", label: "Reviews", href: "/", icon: Star },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
  { id: "categories", label: "Categories", href: "/categories", icon: Tags },
  { id: "word-cloud", label: "Word Cloud", href: "/word-cloud", icon: Cloud },
  { id: "ideation", label: "Ideation", href: "/ideation", icon: Zap },
  { id: "reporting", label: "Reporting", href: "/reporting", icon: FileText },
];

export const MOBILE_NAV_TABS: MobileNavTab[] = [
  { id: "reviews", label: "Reviews", href: "/", icon: Star },
  {
    id: "insights",
    label: "Insights",
    href: "/analytics",
    icon: Lightbulb,
    children: [
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
      { id: "categories", label: "Categories", href: "/categories", icon: Tags },
      { id: "word-cloud", label: "Word Cloud", href: "/word-cloud", icon: Cloud },
    ],
  },
  { id: "ideation", label: "Ideation", href: "/ideation", icon: Zap },
  {
    id: "more",
    label: "More",
    href: "#",
    icon: MoreHorizontal,
    children: [
      { id: "reporting", label: "Reporting", href: "/reporting", icon: FileText },
    ],
  },
];

export const FILTER_TIME_PERIODS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7", label: "Last 7 Days" },
  { id: "last_15", label: "Last 15 Days" },
  { id: "last_30", label: "Last 30 Days" },
  { id: "custom", label: "Custom" },
] as const;

export const FILTER_PLATFORMS = [
  { id: "all", label: "All" },
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
] as const;
