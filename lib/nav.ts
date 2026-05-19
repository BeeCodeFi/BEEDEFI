import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  Brain,
  Video,
  GraduationCap,
  Briefcase,
  Activity,
  Settings,
} from "lucide-react";

/**
 * Single source of truth for navigation. The Sidebar, command palette (future),
 * and route generation all consume this array.
 *
 * `accent` selects a glow color when the route is active — gives each section
 * a subtle identity without needing per-page theming. `badge` is for live
 * counts or status labels; leave undefined for plain entries.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: "cyan" | "magenta" | "amber";
  /** Optional badge — used for "live", counts, or other status. */
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/",        label: "Dashboard",      icon: LayoutDashboard, accent: "cyan" },
  { href: "/agents",  label: "Agents",         icon: Sparkles,        accent: "magenta" },
  { href: "/brain",   label: "Second Brain",   icon: Brain,           accent: "cyan" },
  { href: "/studio",  label: "Creator Studio", icon: Video,           accent: "magenta" },
  { href: "/learn",   label: "Learning",       icon: GraduationCap,   accent: "amber" },
  { href: "/career",  label: "Career",         icon: Briefcase,       accent: "amber" },
  { href: "/health",  label: "Health",         icon: Activity,        accent: "cyan" },
];

export const NAV_FOOTER_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, accent: "cyan" },
];
