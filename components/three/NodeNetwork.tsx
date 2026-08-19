"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { ScrollState } from "@/lib/useScrollProgress";

const NODE_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aTint;
  attribute float aFlare;
  varying float vTint;
  varying float vFlare;
  uniform float uSize;
  uniform float uPixelRatio;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (1.0 + aFlare * 1.6) * uPixelRatio / max(-mv.z, 0.001);
    vTint = aTint;
    vFlare = aFlare;
  }
`;

const NODE_FRAG = /* glsl */ `
  varying float vTint;
  varying float vFlare;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uShift;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float halo = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.18, 0.0, d);

    // Palette drifts from cool blue -> indigo -> cyan as the page scrolls.
    vec3 warm = mix(uColorA, uColorB, vTint);
    vec3 cool = mix(uColorB, uColorC, vTint);
    vec3 col = mix(warm, cool, uShift);

    float a = halo * halo * 0.9 + core * 0.75 + vFlare * halo * 0.9;
    gl_FragColor = vec4(col + core * 0.85 + vFlare * 0.35, a);
  }
`;

export type NetworkConfig = {
  count: number;
  maxLines: number;
  linkDistance: number;
  animate: boolean;
  scrollRef: RefObject<ScrollState>;
};

const COLOR_A = new THREE.Color("#4d8cff");
const COLOR_B = new THREE.Color("#8b5cf6");
const COLOR_C = new THREE.Color("#2dd4bf");

/** Volume the nodes occupy — wider than the viewport so it bleeds off-screen. */
const BOUNDS = { x: 38, y: 24, z: 14 };

export default function NodeNetwork({
  count,
  maxLines,
  linkDistance,
  animate,
  scrollRef,
}: NetworkConfig) {
  const spinRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const driftRef = useRef(0);
  const shiftRef = useRef(0);
  const { size } = useThree();

  const sim = useMemo(() => {
    const home = new Float32Array(count * 3);
    const live = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const amp = new Float32Array(count);
    const scale = new Float32Array(count);
    const tint = new Float32Array(count);
    const flare = new Float32Array(count);
    // Staggered ignition times so nodes flare in a rolling wave, not in unison.
    const pulseAt = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * BOUNDS.x;
      const y = (Math.random() - 0.5) * BOUNDS.y;
      const z = (Math.random() - 0.5) * BOUNDS.z;
      home[i3] = live[i3] = x;
      home[i3 + 1] = live[i3 + 1] = y;
      home[i3 + 2] = live[i3 + 2] = z;
      phase[i] = Math.random() * Math.PI * 2;
      amp[i] = 0.7 + Math.random() * 1.8;
      scale[i] = 0.5 + Math.pow(Math.random(), 2.2) * 1.9;
      tint[i] = Math.random();
      pulseAt[i] = Math.random() * 9;
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(live, 3));
    pointsGeo.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    pointsGeo.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));
    pointsGeo.setAttribute("aFlare", new THREE.BufferAttribute(flare, 1));

    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uSize: { value: 150 },
        uPixelRatio: { value: 1 },
        uColorA: { value: COLOR_A },
        uColorB: { value: COLOR_B },
        uColorC: { value: COLOR_C },
        uShift: { value: 0 },
      },
    });

    const points = new THREE.Points(pointsGeo, pointsMat);
    points.frustumCulled = false;

    const linePos = new Float32Array(maxLines * 6);
    const lineCol = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    lineGeo.setDrawRange(0, 0);

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;

    return {
      home,
      live,
      phase,
      amp,
      flare,
      pulseAt,
      points,
      pointsGeo,
      pointsMat,
      lines,
      lineGeo,
      lineMat,
      linePos,
      lineCol,
    };
  }, [count, maxLines]);

  // Release GPU resources when the scene unmounts or the config changes.
  useEffect(() => {
    return () => {
      sim.pointsGeo.dispose();
      sim.pointsMat.dispose();
      sim.lineGeo.dispose();
      sim.lineMat.dispose();
    };
  }, [sim]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;
    const { home, live, phase, amp, flare, pulseAt, linePos, lineCol } = sim;

    sim.pointsMat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    const scroll = scrollRef.current;
    // Ease the palette shift so section-to-section colour changes feel deliberate.
    shiftRef.current += (scroll.progress - shiftRef.current) * (1 - Math.exp(-2.4 * dt));
    const shift = shiftRef.current;
    sim.pointsMat.uniforms.uShift.value = shift;

    // Scroll momentum kicks the mesh sideways, then bleeds off.
    const kick = THREE.MathUtils.clamp(scroll.velocity * 0.0016, -0.9, 0.9);
    scroll.velocity *= Math.exp(-6 * dt);

    // Cursor position projected onto the z = 0 plane.
    const cx = state.pointer.x * (state.viewport.width / 2);
    const cy = state.pointer.y * (state.viewport.height / 2);
    const R = 6.5;
    const R2 = R * R;
    const PUSH = 3.4;

    // Frame-rate independent damping.
    const k = animate ? 1 - Math.exp(-5 * dt) : 1;
    const wt = animate ? t * 0.18 : 0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const p = phase[i];
      const a = amp[i];

      let tx = home[i3] + Math.sin(wt + p) * a;
      let ty = home[i3 + 1] + Math.cos(wt * 1.28 + p * 1.7) * a;
      const tz = home[i3 + 2] + Math.sin(wt * 0.87 + p * 2.3) * a * 0.7;

      const dx = tx - cx;
      const dy = ty - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2 && d2 > 1e-4) {
        const d = Math.sqrt(d2);
        const f = (1 - d2 / R2) * PUSH;
        tx += (dx / d) * f;
        ty += (dy / d) * f;
      }

      live[i3] += (tx - live[i3]) * k;
      live[i3 + 1] += (ty - live[i3 + 1]) * k;
      live[i3 + 2] += (tz - live[i3 + 2]) * k;

      // Rolling flare: each node ignites on its own 9s cadence, then fades.
      if (animate) {
        const local = (t - pulseAt[i]) % 9;
        flare[i] = local >= 0 && local < 1.4 ? Math.pow(1 - local / 1.4, 2.2) : 0;
      } else {
        flare[i] = 0;
      }
    }
    sim.pointsGeo.attributes.position.needsUpdate = true;
    sim.pointsGeo.attributes.aFlare.needsUpdate = true;

    // Rebuild the links. O(n^2) over a deliberately small n.
    const maxD = linkDistance;
    const maxD2 = maxD * maxD;
    let li = 0;

    outer: for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const xi = live[i3];
      const yi = live[i3 + 1];
      const zi = live[i3 + 2];
      const fi = flare[i];

      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3;
        const dx = live[j3] - xi;
        if (dx > maxD || dx < -maxD) continue;
        const dy = live[j3 + 1] - yi;
        const dz = live[j3 + 2] - zi;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= maxD2) continue;

        const strength = 1 - Math.sqrt(d2) / maxD;
        // A link inherits the brighter of its two endpoints' flares.
        const glow = strength * strength * (0.72 + Math.max(fi, flare[j]) * 1.9);
        const mixT = (zi + BOUNDS.z / 2) / BOUNDS.z;

        const warmR = COLOR_A.r + (COLOR_B.r - COLOR_A.r) * mixT;
        const warmG = COLOR_A.g + (COLOR_B.g - COLOR_A.g) * mixT;
        const warmB = COLOR_A.b + (COLOR_B.b - COLOR_A.b) * mixT;
        const coolR = COLOR_B.r + (COLOR_C.r - COLOR_B.r) * mixT;
        const coolG = COLOR_B.g + (COLOR_C.g - COLOR_B.g) * mixT;
        const coolB = COLOR_B.b + (COLOR_C.b - COLOR_B.b) * mixT;

        const r = (warmR + (coolR - warmR) * shift) * glow;
        const g = (warmG + (coolG - warmG) * shift) * glow;
        const b = (warmB + (coolB - warmB) * shift) * glow;

        const o = li * 6;
        linePos[o] = xi;
        linePos[o + 1] = yi;
        linePos[o + 2] = zi;
        linePos[o + 3] = live[j3];
        linePos[o + 4] = live[j3 + 1];
        linePos[o + 5] = live[j3 + 2];

        lineCol[o] = r;
        lineCol[o + 1] = g;
        lineCol[o + 2] = b;
        lineCol[o + 3] = r;
        lineCol[o + 4] = g;
        lineCol[o + 5] = b;

        if (++li >= maxLines) break outer;
      }
    }

    sim.lineGeo.setDrawRange(0, li * 2);
    sim.lineGeo.attributes.position.needsUpdate = true;
    sim.lineGeo.attributes.color.needsUpdate = true;

    if (!animate) return;

    // Parallax tilt toward the cursor, plus scroll-driven yaw and dolly.
    if (tiltRef.current) {
      const targetY = state.pointer.x * 0.22 + scroll.progress * 0.85;
      const targetX = -state.pointer.y * 0.14 + kick * 0.28;
      const ease = 1 - Math.exp(-3 * dt);
      tiltRef.current.rotation.y += (targetY - tiltRef.current.rotation.y) * ease;
      tiltRef.current.rotation.x += (targetX - tiltRef.current.rotation.x) * ease;

      const targetZ = scroll.progress * 5.5;
      tiltRef.current.position.z += (targetZ - tiltRef.current.position.z) * ease;
    }
    if (spinRef.current) {
      driftRef.current += dt * 0.02 + kick * dt * 0.55;
      spinRef.current.rotation.y = driftRef.current;
    }
  });

  // Nudge the network right on wide screens so it balances the left-aligned copy.
  const offsetX = size.width > 1024 ? 1.5 : 0;

  return (
    <group ref={tiltRef} position={[offsetX, 0, 0]}>
      <group ref={spinRef}>
        <primitive object={sim.lines} />
        <primitive object={sim.points} />
      </group>
    </group>
  );
}
