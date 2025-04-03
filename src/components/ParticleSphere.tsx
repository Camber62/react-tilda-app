import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ParticleSphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    // Создание сферы
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Создание частиц
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });

    const particles = 1000;
    const positions = new Float32Array(particles * 3);

    for (let i = 0; i < particles; i++) {
      const vertex = new THREE.Vector3();
      vertex.x = Math.random() * 4 - 2;
      vertex.y = Math.random() * 4 - 2;
      vertex.z = Math.random() * 4 - 2;
      vertex.toArray(positions, i * 3);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    const animate = () => {
      requestAnimationFrame(animate);

      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particles * 3; i += 3) {
        positions[i] += (Math.random() - 0.5) * 0.01;
        positions[i + 1] += (Math.random() - 0.5) * 0.01;
        positions[i + 2] += (Math.random() - 0.5) * 0.01;
      }

      particleGeometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Обработка изменения размера окна
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default ParticleSphere;