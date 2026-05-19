# BEEDEFI — Project Context for Claude Code

This file is automatically read by Claude Code at the start of every session. It captures architectural decisions, design philosophy, and conventions that aren't obvious from the code alone. Read it fully before suggesting changes.

## What BEEDEFI is

BEEDEFI is an AI-native personal workspace. The aesthetic direction is cinematic, glassmorphic, cyberpunk-inspired — but executed with restraint rather than maximalism. The hierarchy of concerns is: visual polish first, AI functionality second. A polished shell that doesn't yet talk to an LLM is more valuable than a working LLM wrapped in default Tailwind components.

The project is being built in six phases. Phase 1 (visual foundation) is complete. Phases 2 through 6 add 3D depth, agent dashboards, the second brain knowledge graph, the creator studio, and finally the AI backend integration via OpenRouter. Cost-sensitivity matters: the user is building this for free during development, which constrains AI provider choices in Phase 6 (free tier of OpenRouter, free tier of Gemini, free tier of Supabase). Any architectural suggestion that requires paid services should flag that fact explicitly.

## Tech stack and why

Next.js 15 with the App Router, TypeScript in strict mode, Tailwind CSS v3, Framer Motion for general animation, React Three Fiber with Drei helpers for 3D. The Pages Router was explicitly rejected; do not suggest it. Tailwind v4 was considered but v3 was chosen because its TypeScript-config story is more mature for a project that will do significant token customization across phases.

Font choices are Sora for display and body, Geist Mono for code and monospace UI labels. These are loaded via `next/font/google` in `app/layout.tsx`. Avoid the "Space Grotesk on dark" cliché that dominates AI dashboard demos.

The dependency versions in `package.json` may produce peer-dependency warnings during install because React 19 has only recently shipped stable and some ecosystem packages still declare React 18 as a peer. If install fails, run with `--legacy-peer-deps` once.

## Folder structure conventions

The codebase is organized by responsibility rather than by feature, until features grow large enough to justify their own folder. The current layout is:

The `app/` directory holds Next.js routes only. Page files should be thin — most logic lives in components. The `components/` directory splits into `ui/` for reusable design primitives like `GlassPanel` and `Card`, `layout/` for shell pieces like `Sidebar` and `FloatingDock`, `fx/` for visual effects layers like `AmbientBackdrop`, and `three/` for React Three Fiber scenes. The `lib/` directory holds utilities and hooks. There is no `hooks/` directory; hooks live in `lib/` next to other utilities until there are enough of them to justify a split.

When adding new code, prefer extending the existing primitives over creating new ones. If you need a translucent surface, compose `GlassPanel`. If you need a dashboard card, compose `Card`. Reach for new primitives only when you've identified a real pattern that the existing ones can't express cleanly.

## The design system

All design tokens live in `tailwind.config.ts`. Never hardcode hex values in components. The color naming convention is deliberate: `bg-*` for surface backgrounds with 0 being deepest, `ink-*` for text colors with 1 being highest contrast, `signal-*` for the three accent colors, and `edge` for borders.

The three signal colors carry semantic meaning that should be respected across phases. Cyan means active, primary, default highlight. Magenta means AI-generated, thinking, or anything the AI is producing or proposing. Amber means warning, energy, or human attention required. Mixing these will dilute the visual language. Phase 3's agent dashboards will likely add a fourth signal color for "agent network activity" — discuss before adding.

Glow shadows are named utilities — `shadow-glow-cyan`, `shadow-glow-cyan-sm`, `shadow-glow-magenta`, `shadow-glow-amber`. Never reinvent these inline. If you need a new glow recipe, add it to the Tailwind config.

There is a critical Tailwind pattern used throughout: dynamic class names are constructed via lookup objects, never via template literals. The code in `Sidebar.tsx` and `Card.tsx` shows the pattern. Template literals like `` `shadow-glow-${color}` `` will be silently purged from the build because Tailwind's content scanner cannot see the complete class name. If you suggest dynamic styling, use the lookup-object pattern.

## Animation philosophy

The app respects `prefers-reduced-motion` everywhere. The `useReducedCapability` hook in `lib/` extends this to also downgrade for low-memory devices and slow CPUs. When you add new animations or 3D scenes, you must either gate them through this hook or ensure they are CSS-based and self-disable via the reduced-motion media query in `globals.css`.

For continuous-input animations like cursor tracking, scroll-driven effects, or hover proximity, use Framer Motion's `MotionValue` system rather than React state. The `CursorGlow` and `FloatingDock` components demonstrate this. Updating React state at sixty hertz across many components is the most common cause of animation jank, and it is avoided here.

The landing page uses a "staggered cascade" entrance — elements fade and slide in sequentially with delays in the 80-millisecond range. Future pages should follow this pattern. The total cascade duration on any page should stay under one and a half seconds.

For active-state indicators that move between items (like the sidebar's left-edge bar), use Framer Motion's `layoutId` prop. The motion library handles the geometric interpolation automatically.

## Performance budgets

The 3D scenes use a hard budget. The `OrbScene` keeps vertex count under two thousand, uses no shadows, no post-processing, and caps device pixel ratio at 1.5. Phase 2 will add more 3D content but should respect the same budget — if the total scene exceeds roughly five thousand vertices or starts dropping frames on a mid-range laptop, simplify rather than optimize.

Dynamic imports with `ssr: false` are used for any component that touches WebGL or DOM-only APIs. The pattern is in `app/page.tsx` for `OrbScene`. Follow it for any future 3D additions.

## Conventions that matter

The `cn` helper in `lib/cn.ts` is the canonical way to merge Tailwind classes. It uses `clsx` for conditional logic and `tailwind-merge` to resolve conflicting utilities. Use it everywhere class names are composed from props.

Navigation is driven by `lib/nav.ts`. When Phase 3 adds new sections, update this single config and the sidebar, future command palette, and any other consumers all pick it up. Do not hardcode routes elsewhere.

Placeholder routes for unbuilt features exist in `app/agents/`, `app/brain/`, etc. They all render the same `PhasePlaceholder` component with different props. When a phase is implemented, replace the corresponding placeholder rather than creating a new route.

The `dark` class is applied to the html element in the root layout. The app is dark-mode-only by design. Do not add light mode support without an explicit conversation about it — the entire aesthetic depends on the dark substrate.

## Phase status and what's next

Phase 1 is complete: animated landing page with 3D orb, ambient backdrop, sidebar with active-state indicator, floating dock with proximity magnification, glass primitive components, design system tokens, accessibility baseline.

Phase 2 will add holographic companion spheres orbiting the central orb, a proper particle field with mouse-reactive trails (upgrading from the current Drei `Sparkles`), the grid floor moved into the 3D scene with subtle scroll-reactive wave deformation, and cinematic page transitions where the outgoing page contracts into a glowing line. The new particle system should be a separate component from the orb, in `components/three/`, so it can be reused on other pages.

Phase 3 will build the agent dashboard at `/agents` — seven specialized agents with animated avatars, status indicators, activity feeds, task progress, and a network visualization showing data flow between them. This is the most UI-dense phase; expect to add several new primitives.

Phase 4 builds the second brain at `/brain` with a graph-based knowledge visualization, timeline memory, and the journal interface. Consider whether to use a graph library (Cytoscape, React Flow) or build the graph in R3F. The aesthetic vote leans toward R3F for cohesion with the rest of the app, but check performance with a few thousand nodes before committing.

Phase 5 builds the creator studio at `/studio` with script generator, hook lab, thumbnail ideation, and analytics. This is also where the learning, career, and health routes get filled in.

Phase 6 is the only phase that requires backend services. It introduces the AI integration via OpenRouter (using free models — verify current availability when starting this phase, model offerings shift), an optional Supabase free-tier database for persistence, and the multi-agent orchestration layer. The architectural challenge here is the memory manager and prompt manager — design these as plain TypeScript classes in `lib/ai/` with clear interfaces, so they can be swapped or extended.

## How to start a session productively

When you start working on a new task, open the relevant files in the editor and state which phase you're working on. If you're refining Phase 1, mention what feels off about the current implementation. If you're starting a new phase, confirm the scope before generating code — this project has a tendency to grow if you let it, and the visual polish suffers when scope expands too fast.

Run `npm run typecheck` before declaring any change complete. The project uses strict TypeScript and the type errors are usually meaningful.
