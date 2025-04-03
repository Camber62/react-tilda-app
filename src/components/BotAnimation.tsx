import React, { useEffect, useRef } from 'react';
import './BotAnimation.css';

// Интерфейс для частицы
interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const BotAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размеры canvas
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Инициализация частиц
    const numParticles = 50;
    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push({
        x: Math.random() * size,
        y: Math.random() * size,
        radius: Math.random() * 20 + 10, // Большие частицы для эффекта дымки
        speedX: (Math.random() - 0.5) * 1, // Медленное движение
        speedY: (Math.random() - 0.5) * 1,
        opacity: Math.random() * 0.3 + 0.1, // Низкая прозрачность
      });
    }

    // Рисуем текстуру круга
    const drawCircleTexture = () => {
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 5;

      // Рисуем внешний круг с текстурой
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 150, 0.8)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Добавляем текстуру (сетку)
      const segments = 100;
      for (let i = 0; i < segments; i++) {
        const angle = (i * Math.PI * 2) / segments;
        const x1 = centerX + Math.cos(angle) * (radius - 2);
        const y1 = centerY + Math.sin(angle) * (radius - 2);
        const x2 = centerX + Math.cos(angle) * (radius + 2);
        const y2 = centerY + Math.sin(angle) * (radius + 2);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
    
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 5;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(0, 255, 150, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    
      // Рисуем линии между частицами
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
    
          if (distance < 60) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 150, ${0.3 - distance / 60})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    
      // Рисуем частицы
      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
    
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxRadius = radius - particle.radius;
    
        if (distance > maxRadius) {
          const angle = Math.atan2(dy, dx);
          particle.x = centerX + Math.cos(angle) * maxRadius;
          particle.y = centerY + Math.sin(angle) * maxRadius;
          particle.speedX = -particle.speedX * 0.7;
          particle.speedY = -particle.speedY * 0.7;
        }
    
        const particleGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        particleGradient.addColorStop(0, `rgba(0, 255, 150, ${particle.opacity})`);
        particleGradient.addColorStop(1, 'rgba(0, 255, 150, 0)');
    
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();
        ctx.filter = 'blur(5px)';
      });
    
      drawCircleTexture();
      requestAnimationFrame(animate);
    };

    animate();

    // Очистка при размонтировании
    return () => {
      ctx.clearRect(0, 0, size, size);
    };
  }, []);

  return (
    <div className="bot-animation-container">
      <canvas ref={canvasRef} className="bot-animation-canvas" />
    </div>
  );
};

export default BotAnimation;