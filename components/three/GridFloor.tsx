"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A receding wireframe grid floor that sits below the orb and warps subtly as
 * the page scrolls. The shader does three things:
 *   1. Vertex displacement — a low-frequency sin wave biased by scroll, so the
 *      surface "breathes" forward when the user scrolls down.
 *   2. Procedural grid in the fragment shader — sharper than a texture, scales
 *      perfectly with FOV, and gives us per-fragment fade control.
 *   3. Distance fade — the grid dissolves into the deep bg before it would
 *      otherwise reveal the far edge of the plane.
 *
 * Why scroll is read from window directly: framer-motion's useScroll would
 * trigger React renders, and we only want the value inside useFrame. A plain
 * ref kept in sync via a passive scroll listener is the lighter path.
 *
 * Budget: PlaneGeometry 32×32 = ~1024 verts, 1 draw call.
 */
type Props = {
  size?: number;
  segments?: number;
  color?: string;
};

export function GridFloor({
  size = 40,
  segments = 32,
  color = "#5ef0ff",
}: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scrollRef = useRef(0);

  // Passive scroll listener — written to a ref so it never causes a re-render.
  // The shader reads the smoothed value through useFrame below.
  useMemo(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // No cleanup intentionally — the component lives for the page lifetime,
    // and the listener is cheap. If GridFloor ever mounts/unmounts a lot,
    // wire this through a useEffect instead.
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
    // Smooth toward the live scroll value so motion never snaps.
    const u = materialRef.current.uniforms.uScroll;
    u.value += (scrollRef.current * 0.001 - u.value) * 0.08;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[size, size, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec3 pos = position;

    // Plane is rotated -π/2 about X, so the geometry's local Y is the world Z
    // (depth). We displace along local Z, which becomes world Y after rotation.
    float wave =
      sin(pos.x * 0.4 + uTime * 0.6 + uScroll * 2.0) *
      cos(pos.y * 0.4 - uTime * 0.4 - uScroll * 1.5);
    pos.z += wave * 0.25;

    vUv = uv;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    // 1 unit grid in UV space, with fwidth-based anti-aliasing.
    vec2 uv = vUv * 24.0;
    vec2 g = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float line = 1.0 - min(min(g.x, g.y), 1.0);

    // Radial distance fade — pulls focus to center, hides the far edge.
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    float fade = smoothstep(1.0, 0.3, r);

    // Crest highlight — vertices riding the wave crest glow a touch brighter.
    float crest = clamp(vWave * 0.6 + 0.4, 0.0, 1.0);

    float alpha = line * fade * 0.55 * crest;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
