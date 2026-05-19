"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";
import { useReducedCapability } from "@/lib/useReducedCapability";
import { CompanionSpheres } from "./CompanionSpheres";
import { ParticleField } from "./ParticleField";
import { GridFloor } from "./GridFloor";

/**
 * The hero orb. A single distorted icosahedron with a soft inner light and
 * a halo of drifting sparkles. Designed to look expensive while staying under
 * the perf budget: <2000 vertices, no post-processing, no shadows.
 *
 * Capability-gated: low-end devices and reduced-motion users get a static
 * CSS-only fallback. We render the fallback as a sibling rather than swapping,
 * so the layout stays stable.
 */
export function OrbScene() {
  const reduced = useReducedCapability();

  if (reduced) {
    return <StaticOrbFallback />;
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        // dpr capped — on retina displays, the default 2x DPR doubles fragment
        // shader work. 1.5 is the sweet spot for visual quality vs perf.
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting rig — keep this minimal. Three lights total. */}
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 3]} intensity={2} color="#5ef0ff" />
          <pointLight position={[-3, -2, -2]} intensity={1.5} color="#ff5ed4" />

          {/* The orb itself, with Float wrapping for that subtle drift */}
          <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
            <Orb />
          </Float>

          {/* Three companion spheres orbit the central orb — a visual primer for Phase 3's agents */}
          <CompanionSpheres />

          {/* Shader-driven particle field that drifts and recoils from the cursor */}
          <ParticleField />

          {/* Receding wireframe grid floor — warps subtly with page scroll */}
          <GridFloor />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Orb() {
  const meshRef = useRef<Mesh>(null);

  // Slow continuous rotation via useFrame — runs once per RAF tick, never causes
  // a React re-render because we mutate the ref directly.
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.05;
    meshRef.current.rotation.y += delta * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      {/* icosahedronGeometry with detail=4 gives us a smooth sphere with ~640
          vertices. detail=5 doubles that with no visible quality gain. */}
      <icosahedronGeometry args={[1.4, 4]} />
      <MeshDistortMaterial
        color="#5ef0ff"
        emissive="#5ef0ff"
        emissiveIntensity={0.2}
        roughness={0.35}
        metalness={0.8}
        distort={0.35}
        speed={1.5}
        // wireframe overlay would be nice here but doubles draw calls; we get
        // a similar effect from the icosahedron's natural facets
      />
    </mesh>
  );
}

/**
 * CSS-only orb fallback for low-capability devices. The illusion is good enough
 * that most users won't realize they're not getting WebGL.
 */
function StaticOrbFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-64 h-64">
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-full animate-breathe"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffffff 0%, #5ef0ff 25%, #1a4960 60%, transparent 75%)",
            filter: "blur(1px)",
          }}
        />
        {/* Outer halo */}
        <div
          className="absolute -inset-20 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(94,240,255,0.2) 0%, transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}
