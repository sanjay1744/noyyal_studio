"use client";

import { useEffect, useRef } from "react";

class InkParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  decay: number;
  type: 'dash' | 'dot';
  angle: number;
  len: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number) {
    this.x = x + (Math.random() - 0.5) * 14;
    this.y = y + (Math.random() - 0.5) * 14;
    this.size = Math.random() * 2 + 0.4;
    this.opacity = Math.random() * 0.55 + 0.2;
    this.life = 1;
    this.decay = 0.022 + Math.random() * 0.025;
    this.type = Math.random() < 0.45 ? 'dash' : 'dot';
    this.angle = Math.random() * Math.PI * 2;
    this.len = Math.random() * 9 + 2;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
  }

  update() {
    this.life -= this.decay;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life * this.opacity;
    ctx.strokeStyle = '#0c0c0c';
    ctx.fillStyle = '#0c0c0c';
    ctx.lineWidth = this.size * 0.5;
    if (this.type === 'dot') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(this.angle) * this.len, this.y + Math.sin(this.angle) * this.len);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export default function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: InkParticle[] = [];
    let lx = 0;
    let ly = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      const spd = Math.sqrt(dx * dx + dy * dy);
      lx = e.clientX;
      ly = e.clientY;

      const n = Math.min(Math.floor(spd * 0.3) + 1, 5);
      for (let i = 0; i < n; i++) {
        particles.push(new InkParticle(e.clientX, e.clientY));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) {
          particles.splice(i, 1);
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9997]"
    />
  );
}
