"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import NodeNetwork from "./NodeNetwork";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { subscribeVideoCovering } from "@/lib/videoCover";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

type Tier = {
  count: number;
  maxLines: number;
  linkDistance: number;
  dpr: [number, number];
  antialias: boolean;
};

const DESKTOP: Tier = {
  count: 128,
  maxLines: 1100,
  linkDistance: 4.4,
  dpr: [1, 1.75],
  antialias: true,
};

const MOBILE: Tier = {
  count: 58,
  maxLines: 420,
  linkDistance: 5.2,
  dpr: [1, 1.5],
  antialias: false,
};

/**
 * Fixed, full-page WebGL backdrop that sits behind every section.
 * Mounts client-side only, downshifts on small or low-power devices,
 * freezes for reduced-motion users, and stops rendering while the tab
 * is in the background.
 */
export default function Scene({ className = "" }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState(true);
  const [tier, setTier] = useState<Tier>(DESKTOP);
  const [animate, setAnimate] = useState(true);
  const [visible, setVisible] = useState(true);
  const [covered, setCovered] = useState(false);
  const scrollRef = useScrollProgress();

  useEffect(() => {
    if (!detectWebGL()) {
      setSupported(false);
      setReady(true);
      return;
    }

    const smallOrTouch = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    const weakCPU = (navigator.hardwareConcurrency ?? 8) <= 4;

    // On a phone the mesh is behind a playing clip almost everywhere, and the
    // frame budget is better spent on the video. Skip it entirely; the aurora
    // gradient underneath still carries the section that has no clip.
    if (smallOrTouch) {
      setSupported(false);
      setReady(true);
      return;
    }

    setTier(weakCPU ? MOBILE : DESKTOP);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setAnimate(!motionQuery.matches);
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    setReady(true);
    return () => motionQuery.removeEventListener("change", syncMotion);
  }, []);

  // Idle whenever an opaque clip is on top: nothing drawn would be seen, and
  // the spare frame budget goes to video decoding instead.
  useEffect(() => subscribeVideoCovering(setCovered), []);

  // The backdrop is always on screen, so the only reason to idle is a hidden tab.
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className={`fixed inset-0 z-0 ${className}`} aria-hidden="true">
      {/* Always-present gradient: the poster frame, and the no-WebGL fallback. */}
      <div className="aurora absolute inset-0" />

      {ready && supported && (
        <Canvas
          className="!absolute inset-0"
          dpr={tier.dpr}
          frameloop={visible && animate && !covered ? "always" : "demand"}
          camera={{ position: [0, 0, 16], fov: 55, near: 0.1, far: 80 }}
          gl={{
            antialias: tier.antialias,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
        >
          <NodeNetwork
            count={tier.count}
            maxLines={tier.maxLines}
            linkDistance={tier.linkDistance}
            animate={animate}
            scrollRef={scrollRef}
          />
        </Canvas>
      )}

      {/* Vignette keeps copy readable over the brightest part of the mesh. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 48% at 22% 42%, rgba(5,7,15,0.92) 0%, rgba(5,7,15,0.55) 45%, transparent 78%)",
        }}
      />
      {/* Soft floor so long text sections never fight the mesh. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(5,7,15,0.55) 100%)" }}
      />
    </div>
  );
}
