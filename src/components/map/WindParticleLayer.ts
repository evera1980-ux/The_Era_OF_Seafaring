import React, { useEffect, useRef } from "react";

export interface WindParticleLayerProps {
  windSpeedKn: number;
  windDirectionDeg: number;
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speedFactor: number;
}

/**
 * ECDIS 海图实时风场流线粒子层 (HTML5 Canvas Wind Streamlines Overlay)
 */
export const WindParticleLayer: React.FC<WindParticleLayerProps> = ({
  windSpeedKn,
  windDirectionDeg,
  enabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const particleCount = 65;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        age: Math.random() * 100,
        maxAge: 85 + Math.random() * 55,
        speedFactor: 0.75 + Math.random() * 0.5,
      });
    }

    const flowRad = (((windDirectionDeg + 180) % 360) * Math.PI) / 180;
    const basePxPerFrame = Math.max(0.6, Math.min(4.2, windSpeedKn * 0.11));
    const vx = Math.sin(flowRad) * basePxPerFrame;
    const vy = -Math.cos(flowRad) * basePxPerFrame;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isStorm = windSpeedKn >= 28;
      ctx.strokeStyle = isStorm
        ? "rgba(245, 158, 11, 0.34)"
        : "rgba(56, 189, 248, 0.26)";
      ctx.lineWidth = isStorm ? 1.6 : 1.2;
      ctx.lineCap = "round";

      for (const p of particles) {
        const prevX = p.x;
        const prevY = p.y;
        p.x += vx * p.speedFactor;
        p.y += vy * p.speedFactor;
        p.age += 1;

        const tailX = prevX - vx * 6 * p.speedFactor;
        const tailY = prevY - vy * 6 * p.speedFactor;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (
          p.age >= p.maxAge ||
          p.x < -20 ||
          p.x > canvas.width + 20 ||
          p.y < -20 ||
          p.y > canvas.height + 20
        ) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.age = 0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [windSpeedKn, windDirectionDeg, enabled]);

  if (!enabled) return null;

  return React.createElement("canvas", {
    ref: canvasRef,
    className: "absolute inset-0 pointer-events-none z-[5]",
  });
};
