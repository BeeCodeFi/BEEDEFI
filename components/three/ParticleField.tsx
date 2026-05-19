"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A drifting particle field around the orb. Replaces Drei's <Sparkles> with a
 * shader-driven point cloud that responds to cursor proximity — particles near
 * the projected cursor get gently pushed away, like iron filings around a magnet
 * with reversed polarity.
 *
 * Why a shader instead of mutating geometry per frame: 300 particles × 3 floats =
 * 900 array writes per frame is doable but wasteful. The GPU does the drift +
 * repulsion in parallel for free, and we keep the React tree quiet.
 *
 * Budget: 300 verts, 1 draw call, no shadows, additive-blended quads.
 */
type Props = {
  count?: number;
  radius?: number;
  color?: string;
};

export function ParticleField({
  count = 300,
  radius = 6,
  color = "#5ef0ff",
}: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer, camera } = useThree();

  // Smoothed world-space cursor target — avoids the jitter you get when feeding
  // raw normalized-device coords straight into the shader on every frame.
  const mouseWorld = useRef(new THREE.Vector3());
  const tmpVec = useRef(new THREE.Vector3());

  // Base positions distributed in a flattened ellipsoid around the origin so the
  // field reads as a layer, not a sphere. Generated once and frozen.
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.cbrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      positions[i * 3 + 2] = r * Math.cos(phi);
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouseWorld: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: 18 },
    }),
    [color]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;

    // Project the NDC pointer onto the z=0 plane in world space so the shader
    // can repulse particles using a consistent metric regardless of camera FOV.
    tmpVec.current.set(pointer.x, pointer.y, 0.5).unproject(camera);
    tmpVec.current.sub(camera.position).normalize();
    const distance = -camera.position.z / tmpVec.current.z;
    tmpVec.current.multiplyScalar(distance).add(camera.position);
    // Smooth follow — 0.12 feels responsive without being twitchy.
    mouseWorld.current.lerp(tmpVec.current, 0.12);
    materialRef.current.uniforms.uMouseWorld.value.copy(mouseWorld.current);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[seeds, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const VERTEX_SHADER = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec3 uMouseWorld;
  uniform float uSize;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Per-particle drift — aSeed gives each particle its own phase.
    float t = uTime * 0.3 + aSeed * 6.2831;
    pos.x += sin(t) * 0.18;
    pos.y += cos(t * 1.2) * 0.14;
    pos.z += sin(t * 0.7) * 0.12;

    // Repulse from cursor on the xy plane. smoothstep gives a soft falloff
    // so the effect fades out before the visible particle limit.
    vec2 toMouse = pos.xy - uMouseWorld.xy;
    float dist = length(toMouse);
    float strength = smoothstep(2.5, 0.0, dist) * 0.85;
    pos.xy += normalize(toMouse + vec2(0.0001)) * strength;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct point size; clamp to keep close particles sane.
    gl_PointSize = clamp(uSize * (0.5 + aSeed) * (1.0 / -mvPosition.z) * 1.6, 1.0, 24.0);

    vAlpha = 0.35 + aSeed * 0.55;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Soft circular falloff — discard the corners of the point quad.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`;
