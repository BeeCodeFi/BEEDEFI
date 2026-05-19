# BEEDEFI

An AI-native personal workspace. Phase 1: visual foundation.

## Getting started

You need Node 18.18 or newer (Node 20 LTS is recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — development server with Turbopack
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run typecheck` — TypeScript without emit
- `npm run lint` — Next's ESLint config

## Architecture

The codebase is organized by responsibility, not by feature, until features grow large enough to justify their own folder.

```
app/                  Next.js App Router routes
  layout.tsx          Root layout: fonts, ambient backdrop, sidebar
  page.tsx            The dashboard (landing) page
  globals.css         Tailwind layers + design system utilities
components/
  fx/                 Visual effects (ambient backdrop, particles)
  layout/             App shell pieces (Sidebar, CursorGlow, FloatingDock)
  three/              React Three Fiber scenes (OrbScene)
  ui/                 Reusable primitives (GlassPanel, Card)
lib/
  cn.ts               Tailwind class merger
  nav.ts              Centralized navigation config
  useReducedCapability.ts   Performance-budget detection hook
```

## Design system

All design tokens live in `tailwind.config.ts`. Never hardcode hex values in components — reach for `text-ink-1`, `bg-bg-2`, `shadow-glow-cyan`, etc. instead. The full token reference is at the top of the Tailwind config.

The three accent colors (`signal-cyan`, `signal-magenta`, `signal-amber`) carry semantic meaning — cyan is "active/primary," magenta is "AI/generative," amber is "warning/energy." Use them consistently across phases.

## Performance budgets

This app uses 3D and heavy animation. Performance is a feature, not an afterthought. Some guardrails already in place:

- The `useReducedCapability` hook downgrades the 3D orb to a CSS fallback on low-end devices and for users with `prefers-reduced-motion`.
- The cursor glow writes to CSS variables, not React state, so it doesn't trigger re-renders.
- The dock magnification uses Framer Motion's MotionValue system to avoid re-renders during hover.
- DPR is capped at 1.5 on the R3F canvas to keep fragment shader cost reasonable on retina displays.

## Phase 1 deliverables (this commit)

- Animated landing/dashboard with 3D orb, ambient backdrop, and staggered cascade entrance
- Collapsible sidebar with animated active indicator (layoutId magic)
- Floating dock with cursor-proximity magnification
- Reusable `GlassPanel` and `Card` primitives
- Design system: typography scale, color tokens, named glow shadows, glass utilities
- Accessibility: reduced-motion respected throughout, semantic HTML, ARIA labels on icon-only controls

## Upcoming phases

Phase 2 will add holographic spheres, particle trails, depth parallax, mouse-reactive lighting, and an animated grid floor that responds to scroll. Phase 3 brings the agent dashboards. Phase 4 the second brain knowledge graph. Phase 5 the creator studio. Phase 6 the actual AI backend via OpenRouter.
