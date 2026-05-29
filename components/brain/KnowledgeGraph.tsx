"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TAG_HEX, getTagAccent, type Note, type Link } from "@/lib/brain";
import { useReducedCapability } from "@/lib/useReducedCapability";

/**
 * 3D knowledge graph. Notes are nodes (icosahedrons) on a Fibonacci sphere
 * shell, with tag-cluster nudging so related notes group visually. Links are
 * thin lines between connected nodes.
 *
 * Design tradeoffs:
 *   - Deterministic layout precomputed once at mount. No live force sim — the
 *     extra polish isn't worth the per-frame cost for a static corpus.
 *   - Nodes use an InstancedMesh (single draw call) and an instanceColor
 *     attribute so per-tag color works without per-node materials.
 *   - Edges use drei's <Line> per pair — cheap enough for ~40 edges and gives
 *     us per-edge opacity control for the highlight effect.
 *
 * Budget: ~25 nodes × icosahedron(detail=0)=12 verts = ~300 verts for nodes,
 * plus a couple hundred for edge geometry. Well under the 5k soft cap.
 */
type Props = {
  notes: Note[];
  links: Link[];
};

const RADIUS = 5.5;

export function KnowledgeGraph({ notes, links }: Props) {
  const reduced = useReducedCapability();

  // Static fallback for reduced-capability — a clean list of note titles
  // grouped by primary tag. Same data, no WebGL.
  if (reduced) {
    return <GraphFallback notes={notes} />;
  }

  if (notes.length === 0) {
    return (
      <div className="relative h-[380px] sm:h-[440px] md:h-[520px] rounded-2xl overflow-hidden border border-edge flex flex-col items-center justify-center gap-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-ink-4">
          Graph is empty
        </p>
        <p className="text-[12px] text-ink-3 text-center max-w-xs leading-relaxed px-4">
          Capture your first note below — each note becomes a node in the graph.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[380px] sm:h-[440px] md:h-[520px] rounded-2xl overflow-hidden border border-edge">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <pointLight position={[8, 6, 8]} intensity={1.4} color="#5ef0ff" />
          <pointLight position={[-8, -4, -6]} intensity={1} color="#ff5ed4" />
          <GraphScene notes={notes} links={links} />
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            enableZoom
            enablePan={false}
            minDistance={8}
            maxDistance={22}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Suspense>
      </Canvas>

      {/* Hint overlay — non-blocking */}
      <div className="absolute bottom-3 right-4 text-[10px] font-mono uppercase tracking-wider text-ink-3 pointer-events-none">
        Drag to rotate · scroll to zoom · hover a node
      </div>
    </div>
  );
}

function GraphScene({ notes, links }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const tmpObject = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  // Precompute node positions + colors + per-note metadata.
  const layout = useMemo(() => {
    const n = notes.length;
    const positions: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const radii: number[] = [];

    // Tag anchors — each tag gets a Fibonacci direction; notes are nudged
    // toward their primary tag's anchor to create visible clusters.
    const tags = Array.from(new Set(notes.flatMap((x) => x.tags))).sort();
    const anchors = new Map<string, THREE.Vector3>();
    tags.forEach((t, i) => {
      const v = fibonacciPoint(i, tags.length).multiplyScalar(RADIUS);
      anchors.set(t, v);
    });

    for (let i = 0; i < n; i++) {
      const base = fibonacciPoint(i, n).multiplyScalar(RADIUS);
      const primary = notes[i].tags[0];
      const anchor = primary ? anchors.get(primary) : null;
      const pos = anchor
        ? base.lerp(anchor, 0.45) // nudge toward tag cluster
        : base;
      positions.push(pos);

      const accent = getTagAccent(primary);
      colors.push(new THREE.Color(TAG_HEX[accent]));

      // Radius scales with wordCount, gently. Cube root for perceptual size.
      const r = 0.12 + Math.cbrt(notes[i].wordCount / 200) * 0.12;
      radii.push(r);
    }

    return { positions, colors, radii };
  }, [notes]);

  // Map id → index for fast adjacency lookups during hover.
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    notes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [notes]);

  // Adjacency: for each node, which links involve it.
  const adjacency = useMemo(() => {
    const m = new Map<number, Set<number>>();
    links.forEach((l) => {
      const a = indexById.get(l.source);
      const b = indexById.get(l.target);
      if (a == null || b == null) return;
      if (!m.has(a)) m.set(a, new Set());
      if (!m.has(b)) m.set(b, new Set());
      m.get(a)!.add(b);
      m.get(b)!.add(a);
    });
    return m;
  }, [links, indexById]);

  // Push transforms + colors into the InstancedMesh once. The matrix/color
  // updates only re-run when the layout or hover state changes.
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < layout.positions.length; i++) {
      const pos = layout.positions[i];
      const isHovered = hovered === i;
      const isNeighbor =
        hovered !== null && adjacency.get(hovered)?.has(i);
      const scale = isHovered ? 1.7 : isNeighbor ? 1.25 : 1;

      tmpObject.position.copy(pos);
      tmpObject.scale.setScalar(layout.radii[i] * scale);
      tmpObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tmpObject.matrix);

      // Dim non-neighbors when something is hovered.
      const dim =
        hovered !== null && !isHovered && !isNeighbor ? 0.25 : 1;
      tmpColor.copy(layout.colors[i]).multiplyScalar(dim);
      meshRef.current.setColorAt(i, tmpColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [layout, hovered, adjacency, tmpObject, tmpColor]);

  // Gentle global drift — adds life when not actively interacting.
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <group>
      {/* Nodes */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, notes.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(e.instanceId ?? null);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(null);
          document.body.style.cursor = "default";
        }}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          vertexColors
          emissiveIntensity={0.8}
          roughness={0.35}
          metalness={0.5}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Edges — drawn per-pair so we can vary opacity for the highlight. */}
      <Edges
        links={links}
        positions={layout.positions}
        indexById={indexById}
        hovered={hovered}
        adjacency={adjacency}
      />

      {/* Hover label — drei's <Html> auto-projects to screen space. */}
      {hovered !== null && notes[hovered] && (
        <Html
          position={layout.positions[hovered]}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="px-3 py-1.5 rounded-md bg-bg-1/95 border border-edge-strong backdrop-blur-md whitespace-nowrap -translate-y-8">
            <p className="text-[11px] font-display text-ink-1 leading-tight max-w-[260px] whitespace-normal">
              {notes[hovered].title}
            </p>
            <div className="mt-1 flex gap-1.5">
              {notes[hovered].tags.map((t) => (
                <span
                  key={t}
                  className="text-[9px] font-mono uppercase tracking-wider text-ink-3"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Edges({
  links,
  positions,
  indexById,
  hovered,
  adjacency,
}: {
  links: Link[];
  positions: THREE.Vector3[];
  indexById: Map<string, number>;
  hovered: number | null;
  adjacency: Map<number, Set<number>>;
}) {
  return (
    <>
      {links.map((l, i) => {
        const a = indexById.get(l.source);
        const b = indexById.get(l.target);
        if (a == null || b == null) return null;
        const isHovered =
          hovered === null ||
          hovered === a ||
          hovered === b ||
          adjacency.get(hovered)?.has(a) ||
          adjacency.get(hovered)?.has(b);
        const incident =
          hovered !== null && (hovered === a || hovered === b);
        return (
          <Line
            key={i}
            points={[positions[a], positions[b]]}
            color={incident ? "#a78bff" : "#5ef0ff"}
            lineWidth={incident ? 1.4 : 0.7}
            transparent
            opacity={isHovered ? (incident ? 0.95 : 0.18) : 0.05}
            toneMapped={false}
          />
        );
      })}
    </>
  );
}

/**
 * Fibonacci sphere — even point distribution on a unit sphere. Standard
 * formulation: golden angle increments for azimuth, vertical step for latitude.
 */
function fibonacciPoint(i: number, n: number): THREE.Vector3 {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi)
  );
}

function GraphFallback({ notes }: { notes: Note[] }) {
  // Group by primary tag, sorted by tag then by createdAt desc.
  const grouped = notes.reduce<Record<string, Note[]>>((acc, n) => {
    const tag = n.tags[0] ?? "untagged";
    (acc[tag] ??= []).push(n);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-edge bg-bg-1/40 p-6">
      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-4">
        Graph (static fallback for reduced motion)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {Object.entries(grouped).map(([tag, list]) => (
          <div key={tag}>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-2 mb-2">
              #{tag} · {list.length}
            </p>
            <ul className="space-y-1.5">
              {list.map((n) => (
                <li key={n.id} className="text-[13px] text-ink-2 truncate">
                  {n.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
