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
 * Single source of truth for navigation. Phases 3+ add to this array; the
 * Sidebar, command palette (future), and route generation all consume it.
 *
 * `accent` selects a glow color when the route is active — gives each section
 * a subtle identity without needing per-page theming.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: "cyan" | "magenta" | "amber";
  /** Optional badge — used later for "new" tags or counts */
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "cyan" },
  { href: "/agents", label: "Agents", icon: Sparkles, accent: "magenta", badge: "soon" },
  { href: "/brain", label: "Second Brain", icon: Brain, accent: "cyan", badge: "soon" },
  { href: "/studio", label: "Creator Studio", icon: Video, accent: "magenta", badge: "soon" },
  { href: "/learn", label: "Learning", icon: GraduationCap, accent: "amber", badge: "soon" },
  { href: "/career", label: "Career", icon: Briefcase, accent: "amber", badge: "soon" },
  { href: "/health", label: "Health", icon: Activity, accent: "cyan", badge: "soon" },
];

export const NAV_FOOTER_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, accent: "cyan", badge: "soon" },
];
