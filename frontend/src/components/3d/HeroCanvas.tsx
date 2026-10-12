import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeroCanvasProps {
  onExploreClick?: () => void;
  onWineAiClick?: () => void;
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({ onExploreClick, onWineAiClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080911, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 4, 30);
    violetLight.position.set(-6, 4, 6);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 4, 30);
    cyanLight.position.set(6, -4, 6);
    scene.add(cyanLight);

    // 1. Central AI Core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      emissive: 0x4338ca,
      emissiveIntensity: 0.3
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    const coreWireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const coreWireMesh = new THREE.Mesh(coreGeo, coreWireMat);
    coreWireMesh.scale.setScalar(1.02);
    coreGroup.add(coreWireMesh);

    // Outer orbital rings
    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.03, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.6, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 2. Neural Network Nodes & Connections
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    const layers = [
      { count: 5, x: -7, color: 0x38bdf8 },
      { count: 7, x: -3.5, color: 0xa855f7 },
      { count: 7, x: 3.5, color: 0xa855f7 },
      { count: 4, x: 7, color: 0x06b6d4 }
    ];

    const nodePositions: THREE.Vector3[][] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.18, 16, 16);

    layers.forEach((layer) => {
      const layerPositions: THREE.Vector3[] = [];
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: layer.color,
        emissive: layer.color,
        emissiveIntensity: 0.7,
        roughness: 0.3
      });

      const ySpacing = 6.0 / (layer.count - 1);
      for (let i = 0; i < layer.count; i++) {
        const y = -3.0 + i * ySpacing;
        const z = (Math.random() - 0.5) * 2.5;
        const pos = new THREE.Vector3(layer.x, y, z);
        layerPositions.push(pos);

        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.copy(pos);
        networkGroup.add(node);
      }
      nodePositions.push(layerPositions);
    });

    // Synaptic Connection Lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.25
    });

    for (let l = 0; l < nodePositions.length - 1; l++) {
      const currentLayer = nodePositions[l];
      const nextLayer = nodePositions[l + 1];

      currentLayer.forEach(fromPos => {
        nextLayer.forEach(toPos => {
          if (Math.random() > 0.4) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
            const line = new THREE.Line(lineGeo, lineMaterial);
            networkGroup.add(line);
          }
        });
      });
    }

    // 3. Floating Data Pulses
    const pulseCount = 35;
    const pulseGeometry = new THREE.SphereGeometry(0.09, 8, 8);
    const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const pulses: { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; progress: number; speed: number }[] = [];

    for (let i = 0; i < pulseCount; i++) {
      const layerIdx = Math.floor(Math.random() * (nodePositions.length - 1));
      const fromLayer = nodePositions[layerIdx];
      const toLayer = nodePositions[layerIdx + 1];
      const fromPos = fromLayer[Math.floor(Math.random() * fromLayer.length)];
      const toPos = toLayer[Math.floor(Math.random() * toLayer.length)];

      const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
      mesh.position.copy(fromPos);
      networkGroup.add(mesh);

      pulses.push({
        mesh,
        from: fromPos,
        to: toPos,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.012
      });
    }

    // 4. Background Starfield / Particle Cloud
    const starsCount = 450;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = (Math.random() - 0.5) * 25;
      starPositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Mouse Parallax Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetMouseX = (x - 0.5) * 2;
      targetMouseY = (y - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      camera.position.x = currentMouseX * 1.5;
      camera.position.y = -currentMouseY * 1.0;
      camera.lookAt(0, 0, 0);

      // Rotate AI Core
      coreGroup.rotation.y = elapsedTime * 0.25;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.15;
      ring1.rotation.z = elapsedTime * 0.4;
      ring2.rotation.z = -elapsedTime * 0.35;

      // Pulse data packets along synapses
      pulses.forEach(pulse => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          // Re-pick random connections
          const layerIdx = Math.floor(Math.random() * (nodePositions.length - 1));
          pulse.from = nodePositions[layerIdx][Math.floor(Math.random() * nodePositions[layerIdx].length)];
          pulse.to = nodePositions[layerIdx + 1][Math.floor(Math.random() * nodePositions[layerIdx + 1].length)];
        }
        pulse.mesh.position.lerpVectors(pulse.from, pulse.to, pulse.progress);
      });

      // Subtle starfield rotation
      starField.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] bg-[#080911] overflow-hidden select-none border-b border-[#22263d]">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* Fallback for devices without WebGL */}
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center bg-radial from-violet-950/30 to-[#080911]">
          <div className="w-72 h-72 rounded-full border border-violet-500/30 animate-pulse flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-cyan-400/30 flex items-center justify-center">
              <span className="text-cyan-400 text-sm font-mono tracking-widest">AI CORE SIMULATION</span>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphic Cyber Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080911] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#080911]/40 to-[#080911]/90 pointer-events-none" />

      {/* Foreground Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 pointer-events-none">
        <div className="max-w-4xl space-y-6 pointer-events-auto mt-4">
          {/* Futuristic Lab Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Interactive Machine Learning Research Platform</span>
          </div>

          {/* Mandatory Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Explore Intelligence.{' '}
            <span className="text-gradient-violet-cyan block mt-1">
              Understand Predictions.
            </span>
          </h1>

          {/* Mandatory Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            An interactive machine learning laboratory to train models, compare algorithms, visualize predictions, and explain AI decisions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onExploreClick}
              className="px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
            >
              <span>Launch ML Studio</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={onWineAiClick}
              className="px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-cyan-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 backdrop-blur-md"
            >
              <span>Explore Wine Quality AI</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300">Flagship</span>
            </button>
          </div>

          {/* Quick Stat Pill Indicators */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>16+ Algorithms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>UCI Wine Benchmark</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>SHAP TreeExplainer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
