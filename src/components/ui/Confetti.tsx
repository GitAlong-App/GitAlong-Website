import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '../../lib/motion';

/**
 * Canvas confetti (spec §3 Celebration): ≈ 80 particles in brand colours,
 * gravity plus spin, 1.8 s. Drawn on one <canvas>, so the DOM never
 * re-lays out. Renders nothing when the user prefers reduced motion.
 */
const COLORS = ['#16A34A', '#22C55E', '#7C3AED', '#F97316', '#F59E0B', '#0EA5E9', '#EF4444'];
const DURATION = 1800;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  phase: number;
  color: string;
  round: boolean;
}

export interface ConfettiProps {
  /** Change this value to fire another burst. */
  burstKey?: string | number;
  particleCount?: number;
  /** Burst origin as a fraction of the viewport (default: centre, a bit above middle). */
  origin?: { x: number; y: number };
  /** Render into document.body (use inside transformed containers such as toasts). */
  portal?: boolean;
  className?: string;
}

export const Confetti: React.FC<ConfettiProps> = ({
  burstKey = 0,
  particleCount = 80,
  origin = { x: 0.5, y: 0.38 },
  portal = false,
  className = '',
}) => {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ox = width * origin.x;
    const oy = height * origin.y;
    const scale = Math.max(0.7, Math.min(1.3, width / 900));
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const angle = (-90 + (Math.random() * 2 - 1) * 70) * (Math.PI / 180);
      const speed = (7 + Math.random() * 9) * scale;
      return {
        x: ox + (Math.random() - 0.5) * 40,
        y: oy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.35,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() < 0.3,
      };
    });

    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    const frame = (now: number) => {
      const elapsed = now - t0;
      const dt = Math.min(2.5, (now - last) / (1000 / 60));
      last = now;
      ctx.clearRect(0, 0, width, height);
      const fade = elapsed > DURATION * 0.7 ? Math.max(0, 1 - (elapsed - DURATION * 0.7) / (DURATION * 0.3)) : 1;
      ctx.globalAlpha = fade;
      for (const p of particles) {
        p.vy += 0.32 * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.985, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.phase += 0.12 * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.phase));
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (elapsed < DURATION) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, width, height);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [burstKey, particleCount, origin.x, origin.y, reduced]);

  if (reduced) return null;
  const canvas = (
    <canvas ref={canvasRef} aria-hidden className={`pointer-events-none fixed inset-0 z-[80] ${className}`} />
  );
  return portal ? createPortal(canvas, document.body) : canvas;
};
