/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'ring';
}

interface ParticleCanvasProps {
  effectType?: string;
}

export interface ParticleCanvasHandle {
  burst: (x: number, y: number, color?: string, count?: number) => void;
}

export const ParticleCanvas = React.forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(
  ({ effectType = 'effect_default' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animIdRef = useRef<number | null>(null);

    React.useImperativeHandle(ref, () => ({
      burst: (x: number, y: number, customColor?: string, customCount?: number) => {
        const count = customCount || (effectType === 'effect_confetti' ? 36 : 20);
        const palette =
          effectType === 'effect_confetti'
            ? ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
            : effectType === 'effect_sparks'
            ? ['#fbbf24', '#f59e0b', '#fde047', '#ffffff']
            : effectType === 'effect_sonic'
            ? ['#38bdf8', '#0284c7', '#e0f2fe']
            : [customColor || '#38bdf8', '#ffffff'];

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1.5;
          const color = palette[Math.floor(Math.random() * palette.length)];

          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color,
            alpha: 1,
            life: 0,
            maxLife: Math.random() * 25 + 30,
            shape: effectType === 'effect_confetti' ? 'square' : effectType === 'effect_sonic' ? 'ring' : 'circle',
          });
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      let lastTime = performance.now();

      const loop = (time: number) => {
        const dt = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += dt * 60;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // Gentle gravity
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.alpha <= 0 || p.life >= p.maxLife) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;

          if (p.shape === 'square') {
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          } else if (p.shape === 'ring') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + p.life / 10), 0, Math.PI * 2);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        animIdRef.current = requestAnimationFrame(loop);
      };

      animIdRef.current = requestAnimationFrame(loop);

      return () => {
        if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
        window.removeEventListener('resize', resize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        aria-hidden="true"
      />
    );
  }
);
