import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * GlassPanel — the lowest-level translucent surface in the design system.
 * Everything that looks like "frosted glass" in the app composes this component.
 *
 * Variants:
 *   - default : subtle, used for most surfaces
 *   - strong  : higher contrast, used for popovers and modals
 *
 * The `edge` prop adds the top-edge highlight line (the bright thread across
 * the top of the pane that sells the "real glass catching light" feel).
 */

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong";
  edge?: boolean;
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    { className, variant = "default", edge = false, children, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          variant === "strong" ? "glass-strong" : "glass",
          edge && "glass-edge",
          "rounded-2xl",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
