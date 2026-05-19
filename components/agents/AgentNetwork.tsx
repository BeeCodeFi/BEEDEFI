"use client";

import { useMemo, useState } from "react";
import { AGENTS, AGENT_EDGES, type AgentId } from "@/lib/agents";

/**
 * The agent-bus visualization: seven nodes on a circle, curved edges pulled
 * toward the center to give the diagram a "bus" feel rather than a flat web,
 * and violet packets travelling along each edge to show live data flow.
 *
 * Why SVG rather than R3F: this is a 2D graph at heart, and SVG gives us
 * crisp paths at any zoom level, native motion via animateMotion (no JS
 * tick), and trivial pointer events for hover highlighting. R3F would be
 * a sledgehammer here.
 *
 * Hover behavior: hovering any agent dims unrelated edges and brightens the
 * edges incident to that agent, so the user can see at a glance who talks
 * to whom.
 */

const W = 800;
const H = 520;
const CX = W / 2;
const CY = H / 2;
const RADIUS = 200;
const NODE_R = 24;

// Inline hex map — we're inside an SVG, Tailwind utilities don't apply
// uniformly to fill/stroke on every element, so we hand-pick the colors.
const ACCENT_HEX: Record<"cyan" | "magenta" | "amber", string> = {
  cyan: "#5ef0ff",
  magenta: "#ff5ed4",
  amber: "#ffb547",
};

const VIOLET = "#a78bff";

export function AgentNetwork() {
  const [hovered, setHovered] = useState<AgentId | null>(null);

  // Polar layout. Starting at the top (−π/2) and walking clockwise so the
  // ordering in AGENTS reads top-right-bottom-left.
  const nodes = useMemo(() => {
    return AGENTS.map((a, i) => {
      const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...a,
        x: CX + Math.cos(angle) * RADIUS,
        y: CY + Math.sin(angle) * RADIUS,
      };
    });
  }, []);

  const nodeById = useMemo(() => {
    const m = new Map<AgentId, (typeof nodes)[number]>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  // Pre-compute curved bezier paths through a center-biased control point.
  // The pull factor 0.35 gives a noticeable curve without making the edges
  // bunch unreadably in the middle.
  const edges = useMemo(() => {
    return AGENT_EDGES.map(([fromId, toId], i) => {
      const a = nodeById.get(fromId)!;
      const b = nodeById.get(toId)!;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const pull = 0.35;
      const cx = midX + (CX - midX) * pull;
      const cy = midY + (CY - midY) * pull;
      const path = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
      return {
        fromId,
        toId,
        path,
        // Stagger durations + delays so the packets don't pulse in lockstep.
        dur: 3.5 + (i % 4) * 0.6,
        delay: (i % 5) * 0.4,
        key: `${fromId}-${toId}-${i}`,
      };
    });
  }, [nodeById]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Agent network">
        {/* Central hub ring — a faint marker of where the bus 'lives' */}
        <circle
          cx={CX}
          cy={CY}
          r={70}
          fill="none"
          stroke={VIOLET}
          strokeOpacity={0.18}
          strokeWidth={1}
          strokeDasharray="3 5"
        />
        <circle
          cx={CX}
          cy={CY}
          r={28}
          fill="none"
          stroke={VIOLET}
          strokeOpacity={0.35}
          strokeWidth={1}
        />

        {/* Edges + animated packets */}
        <g>
          {edges.map((e) => {
            const isHighlighted =
              hovered === null || hovered === e.fromId || hovered === e.toId;
            const dimmed = hovered !== null && !isHighlighted;
            return (
              <g key={e.key}>
                <path
                  d={e.path}
                  fill="none"
                  stroke={VIOLET}
                  strokeWidth={1.25}
                  strokeOpacity={dimmed ? 0.08 : 0.45}
                  style={{ transition: "stroke-opacity 0.3s" }}
                />
                <circle
                  r={2.6}
                  fill={VIOLET}
                  opacity={dimmed ? 0.15 : 1}
                  style={{
                    filter: "drop-shadow(0 0 4px #a78bff)",
                    transition: "opacity 0.3s",
                  }}
                >
                  <animateMotion
                    dur={`${e.dur}s`}
                    begin={`${e.delay}s`}
                    repeatCount="indefinite"
                    path={e.path}
                    rotate="auto"
                  />
                </circle>
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        {nodes.map((n) => {
          const color = ACCENT_HEX[n.accent];
          const isHovered = hovered === n.id;
          const Icon = n.icon;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Outer soft glow */}
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R + 12}
                fill={color}
                opacity={isHovered ? 0.28 : 0.12}
                style={{ filter: "blur(10px)", transition: "opacity 0.3s" }}
              />
              {/* Frame */}
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill="#0a0d14"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={isHovered ? 1 : 0.6}
                style={{ transition: "stroke-opacity 0.3s" }}
              />
              {/* Nested SVG hosting the Lucide icon — Lucide renders its own
                  <svg>, and SVG-in-SVG with explicit x/y/width/height is the
                  cleanest way to embed it at a position. */}
              <svg x={n.x - 11} y={n.y - 11} width={22} height={22}>
                <Icon color={color} strokeWidth={1.5} />
              </svg>
              {/* Label */}
              <text
                x={n.x}
                y={n.y + NODE_R + 18}
                textAnchor="middle"
                fill="#c8cfde"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                  pointerEvents: "none",
                }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Title overlay — sits inside the viz frame, doesn't reflow the SVG */}
      <div className="absolute top-3 left-4 flex flex-col gap-0.5 pointer-events-none">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal-violet">
          Agent network
        </p>
        <p className="text-[10px] font-mono text-ink-3">
          {AGENTS.length} agents · {AGENT_EDGES.length} channels
        </p>
      </div>
    </div>
  );
}
