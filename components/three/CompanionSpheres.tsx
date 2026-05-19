"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

/**
 * Three smaller holographic spheres on slow orbits around the central orb.
 * Each carries one of the signal colors so the trio reads as the orb's
 * "agent companions" — a visual primer for Phase 3.
 *
 * Geometry budget: 3 × icosahedron(detail=2) = ~480 verts.
 * No shadows, no post-fx — wireframe + emissive does the heavy lifting.
 */
const COMPANIONS = [
  { color: "#5ef0ff", radius: 2.4, speed: 0.35, phase: 0,            yOffset: 0.6,  scale: 0.32 },
  { color: "#ff5ed4", radius: 2.8, speed: 0.22, phase: Math.PI * 0.7, yOffset: -0.5, scale: 0.26 },
  { color: "#ffb547", radius: 2.2, speed: 0.5,  phase: Math.PI * 1.4, yOffset: 0.2,  scale: 0.22 },
] as const;

export function CompanionSpheres() {
  return (
    <group>
      {COMPANIONS.map((c, i) => (
        <Companion key={i} {...c} />
      ))}
    </group>
  );
}

type CompanionProps = (typeof COMPANIONS)[number];

function Companion({ color, radius, speed, phase, yOffset, scale }: CompanionProps) {
  const orbitRef = useRef<Group>(null);

  // Drive orbit position imperatively in useFrame — no React state, no re-renders.
  useFrame((state) => {
    if (!orbitRef.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    orbitRef.current.position.x = Math.cos(t) * radius;
    orbitRef.current.position.z = Math.sin(t) * radius;
    orbitRef.current.position.y = yOffset + Math.sin(t * 1.3) * 0.15;
  });

  return (
    <group ref={orbitRef}>
      {/* Float adds a subtle independent bob so the companions don't feel mechanically tethered */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.3}>
        <mesh scale={scale}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.4}
            metalness={0.6}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}
