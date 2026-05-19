import type { Config } from "tailwindcss";

/**
 * BEEDEFI design system.
 *
 * Philosophy: a small, opinionated token set. Every value here is referenced
 * by name across the codebase — never hardcode hex values in components.
 *
 * Color naming convention:
 *   - `bg`     : surface backgrounds (deepest to lightest)
 *   - `ink`    : text colors (high to low contrast)
 *   - `signal` : accent colors used semantically (cyan = active, amber = alert, magenta = AI)
 *   - `edge`   : borders and dividers
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#05060a", // page background — near black with a touch of blue
          1: "#0a0d14", // raised surface
          2: "#10141d", // card
          3: "#161b27", // elevated card / popover
        },
        ink: {
          1: "#f1f4fb", // primary text
          2: "#c8cfde", // secondary text (body, descriptions)
          3: "#97a0b5", // tertiary text (small labels, icons) — bumped for readability on dark substrate
          4: "#5a607a", // disabled / very-low emphasis
        },
        signal: {
          cyan: "#5ef0ff",   // active state, primary accent
          amber: "#ffb547",  // warnings, energy
          magenta: "#ff5ed4", // AI thinking / generative state (single-agent)
          violet: "#a78bff",  // agent-network / inter-agent data flow (Phase 3)
        },
        edge: {
          DEFAULT: "rgba(255,255,255,0.10)",
          strong: "rgba(255,255,255,0.18)",
          glow: "rgba(94,240,255,0.35)",
        },
      },
      fontFamily: {
        // Loaded via next/font in app/layout.tsx — these names match the CSS vars
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Tightened scale — workspaces benefit from clear hierarchy without giant headings
        "display-xl": ["clamp(3rem, 6vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 4vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        // Named glow recipes — use these, never reinvent
        "glow-cyan": "0 0 0 1px rgba(94,240,255,0.25), 0 0 24px -4px rgba(94,240,255,0.45), 0 0 48px -12px rgba(94,240,255,0.35)",
        "glow-cyan-sm": "0 0 0 1px rgba(94,240,255,0.2), 0 0 12px -2px rgba(94,240,255,0.4)",
        "glow-magenta": "0 0 0 1px rgba(255,94,212,0.25), 0 0 32px -6px rgba(255,94,212,0.5)",
        "glow-amber": "0 0 0 1px rgba(255,181,71,0.25), 0 0 24px -4px rgba(255,181,71,0.45)",
        "glow-violet": "0 0 0 1px rgba(167,139,255,0.25), 0 0 28px -4px rgba(167,139,255,0.5)",
        "glow-violet-sm": "0 0 0 1px rgba(167,139,255,0.2), 0 0 12px -2px rgba(167,139,255,0.4)",
        // Inner highlight for glass panels — this is the secret to good glassmorphism
        "inset-hi": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        // Ambient gradients used as page/section backdrops
        "mesh-1": "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(94,240,255,0.12), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(255,94,212,0.08), transparent 60%)",
        "grid-line": "linear-gradient(rgba(94,240,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(94,240,255,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-32": "32px 32px",
      },
      animation: {
        // All long-form animations are easing-controlled and respect reduced-motion via CSS
        "breathe": "breathe 6s ease-in-out infinite",
        "drift": "drift 20s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "scan-line": "scan-line 8s linear infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.03)", opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(2%, -1.5%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
