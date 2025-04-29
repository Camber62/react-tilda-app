import { useEffect, useRef } from 'react';
import './animation.css';

const GlowingSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width = 300; // Размер canvas
    const height = canvas.height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120; // Радиус сферы

    let time = 0;

    // Функция для рисования волн
    const drawWaves = () => {
      ctx.clearRect(0, 0, width, height);

      // Рисуем фон сферы
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.fill();

      // Рисуем волны внутри
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);

      for (let x = -radius; x <= radius; x += 1) {
        const y = Math.sin(x * 0.05 + time) * 20 + Math.sin(x * 0.03 + time * 0.5) * 10;
        ctx.lineTo(centerX + x, centerY + y);
      }

      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 255, 150, 0.3)';
      ctx.fill();

      // Рисуем сетку (опционально)
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - (i * 6), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 150, ${0.1 - i * 0.005})`;
        ctx.stroke();
      }

      time += 0.05; // Скорость анимации
      requestAnimationFrame(drawWaves);
    };

    drawWaves();
  }, []);

  return (
    <div className="sphere-container">
      <canvas ref={canvasRef} className="glowing-sphere" />
    </div>
  );
};

export default GlowingSphere;