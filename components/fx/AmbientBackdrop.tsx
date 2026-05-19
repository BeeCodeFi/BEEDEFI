/**
 * AmbientBackdrop renders the three persistent atmosphere layers that sit
 * behind every page. All layers are fixed, pointer-events-none, and z-0.
 *
 * Why a component rather than CSS in body: keeping the noise SVG inline makes
 * it themable per-page later (Phase 5's creator studio may want warmer grain),
 * and we can conditionally swap layers without touching globals.
 */
export function AmbientBackdrop() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Layer 1: deep gradient base. The body bg color shows through if this fails to load. */}
      <div className="absolute inset-0 ambient-mesh" />

      {/* Layer 2: masked grid floor — gives the eye something to track in empty regions */}
      <div className="absolute inset-0 grid-floor opacity-60" />

      {/* Layer 3: vignette — pulls focus to center, hides edge banding */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 55%, rgba(5,6,10,0.3) 100%)",
        }}
      />

      {/* Layer 4: film grain via inline SVG turbulence. The mix-blend-overlay makes it
          interact with whatever is beneath, so dark areas get a touch lighter and lit
          areas get a touch grittier. Critical for the "real screen" feel. */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
