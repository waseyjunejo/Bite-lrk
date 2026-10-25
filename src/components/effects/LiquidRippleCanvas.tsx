import React, { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
  color: string;
  lineWidth: number;
  decay: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

interface LiquidRippleCanvasProps {
  interactive?: boolean;
  intensityMode?: 'vibrant' | 'subtle' | 'minimal';
}

export const LiquidRippleCanvas: React.FC<LiquidRippleCanvasProps> = ({
  interactive = true,
  intensityMode = 'vibrant',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const lastMoveTime = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Singleton AudioContext to prevent hardware context exhaustion leaks
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle synthesized water droplet sound via Web Audio API (no external file load)
  const playWaterDropSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch drop simulation (droplet 'plop')
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext might be blocked until user gesture, ignore gracefully
    }
  };

  const addRipple = (x: number, y: number, isClick = false) => {
    const isVibrant = intensityMode === 'vibrant';
    const maxR = isClick ? (isVibrant ? 160 : 110) : (isVibrant ? 70 : 45);
    const speed = isClick ? 4.5 : 2.2;
    const baseIntensity = isClick ? 0.65 : 0.28;

    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: maxR,
      speed,
      intensity: baseIntensity,
      color: '6, 182, 212', // Cyan #06B6D4
      lineWidth: isClick ? 2.5 : 1.2,
      decay: isClick ? 0.012 : 0.022,
    });

    // Spawn concentric secondary ring on click
    if (isClick) {
      setTimeout(() => {
        ripplesRef.current.push({
          x,
          y,
          radius: 0,
          maxRadius: maxR * 0.75,
          speed: speed * 0.8,
          intensity: baseIntensity * 0.5,
          color: '56, 189, 248', // Sky 400
          lineWidth: 1.5,
          decay: 0.016,
        });
      }, 70);

      // Add small water splash droplets
      const count = isVibrant ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speedVal = 1.5 + Math.random() * 3.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speedVal,
          vy: Math.sin(angle) * speedVal,
          alpha: 0.8,
          size: 1.5 + Math.random() * 2.5,
          color: '6, 182, 212',
        });
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse movement hover liquid disturbance
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const now = performance.now();
      if (now - lastMoveTime.current < 45) return; // limit frequency for high FPS
      lastMoveTime.current = now;

      const x = e.clientX;
      const y = e.clientY;

      if (lastMousePos.current) {
        const dx = x - lastMousePos.current.x;
        const dy = y - lastMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 18) {
          addRipple(x, y, false);
          lastMousePos.current = { x, y };
        }
      } else {
        lastMousePos.current = { x, y };
        addRipple(x, y, false);
      }
    };

    // Click wave
    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      addRipple(e.clientX, e.clientY, true);
      playWaterDropSound();
    };

    // Touch tap & drag support for iOS / Mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return;
      const touch = e.touches[0];
      const now = performance.now();
      if (now - lastMoveTime.current < 60) return;
      lastMoveTime.current = now;
      addRipple(touch.clientX, touch.clientY, false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return;
      const touch = e.touches[0];
      addRipple(touch.clientX, touch.clientY, true);
      playWaterDropSound();
    };

    // Scroll ripple wake
    const handleScroll = () => {
      if (!interactive) return;
      const randomX = Math.random() * width;
      const scrollYPos = Math.random() > 0.5 ? 40 : height - 40;
      addRipple(randomX, scrollYPos, false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.radius += ripple.speed;
        ripple.intensity -= ripple.decay;

        if (ripple.intensity <= 0 || ripple.radius >= ripple.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ripple.color}, ${Math.max(0, ripple.intensity)})`;
        ctx.lineWidth = ripple.lineWidth;
        ctx.shadowColor = `rgba(${ripple.color}, ${Math.max(0, ripple.intensity * 0.8)})`;
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Inner soft radial shimmer
        const grad = ctx.createRadialGradient(
          ripple.x,
          ripple.y,
          Math.max(0, ripple.radius - 8),
          ripple.x,
          ripple.y,
          ripple.radius + 6
        );
        grad.addColorStop(0, `rgba(${ripple.color}, 0)`);
        grad.addColorStop(0.5, `rgba(${ripple.color}, ${Math.max(0, ripple.intensity * 0.2)})`);
        grad.addColorStop(1, `rgba(${ripple.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Render splash droplets
      for (let j = particlesRef.current.length - 1; j >= 0; j--) {
        const p = particlesRef.current[j];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // subtle gravity
        p.alpha -= 0.024;

        if (p.alpha <= 0) {
          particlesRef.current.splice(j, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [interactive, intensityMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
