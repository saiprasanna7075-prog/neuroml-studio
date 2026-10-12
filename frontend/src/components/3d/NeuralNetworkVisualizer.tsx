import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const NeuralNetworkVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activationSpeed, setActivationSpeed] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<string>('All Layers');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e1a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b5cf6, 3, 25);
    pointLight.position.set(0, 5, 8);
    scene.add(pointLight);

    const nnGroup = new THREE.Group();
    scene.add(nnGroup);

    // Layer definitions:
    // Input: 11 wine features
    // Hidden 1: 8 neurons
    // Hidden 2: 6 neurons
    // Output: 3 quality output neurons
    const layerDefs = [
      { name: 'Input Layer', count: 11, x: -7, color: 0x38bdf8 },
      { name: 'Hidden 1', count: 8, x: -2.3, color: 0xa855f7 },
      { name: 'Hidden 2', count: 6, x: 2.3, color: 0xa855f7 },
      { name: 'Output Layer', count: 3, x: 7, color: 0x10b981 }
    ];

    const nodePositions: THREE.Vector3[][] = [];
    const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);

    layerDefs.forEach(ld => {
      const positions: THREE.Vector3[] = [];
      const mat = new THREE.MeshStandardMaterial({
        color: ld.color,
        emissive: ld.color,
        emissiveIntensity: 0.6
      });

      const ySpacing = 7.5 / Math.max(ld.count - 1, 1);
      for (let i = 0; i < ld.count; i++) {
        const y = -3.75 + i * ySpacing;
        const pos = new THREE.Vector3(ld.x, y, (Math.random() - 0.5) * 1.5);
        positions.push(pos);

        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.copy(pos);
        nnGroup.add(mesh);
      }
      nodePositions.push(positions);
    });

    // Connecting Synaptic Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.2 });
    for (let l = 0; l < nodePositions.length - 1; l++) {
      const froms = nodePositions[l];
      const tos = nodePositions[l + 1];
      froms.forEach(fromPos => {
        tos.forEach(toPos => {
          if (Math.random() > 0.35) {
            const line = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([fromPos, toPos]),
              lineMat
            );
            nnGroup.add(line);
          }
        });
      });
    }

    // Activation Pulses
    interface Pulse {
      mesh: THREE.Mesh;
      from: THREE.Vector3;
      to: THREE.Vector3;
      progress: number;
      speed: number;
      layerIdx: number;
    }
    const pulses: Pulse[] = [];
    const pulseGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < 30; i++) {
      const lIdx = Math.floor(Math.random() * (nodePositions.length - 1));
      const fromPos = nodePositions[lIdx][Math.floor(Math.random() * nodePositions[lIdx].length)];
      const toPos = nodePositions[lIdx + 1][Math.floor(Math.random() * nodePositions[lIdx + 1].length)];

      const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pMesh.position.copy(fromPos);
      nnGroup.add(pMesh);

      pulses.push({
        mesh: pMesh,
        from: fromPos,
        to: toPos,
        progress: Math.random(),
        speed: 0.01 + Math.random() * 0.01,
        layerIdx: lIdx
      });
    }

    // Animation Loop
    let angle = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.003;

      nnGroup.rotation.y = Math.sin(angle) * 0.25;

      pulses.forEach(p => {
        p.progress += p.speed * activationSpeed;
        if (p.progress >= 1) {
          p.progress = 0;
          const nextLIdx = (p.layerIdx + 1) % (nodePositions.length - 1);
          p.layerIdx = nextLIdx;
          p.from = nodePositions[nextLIdx][Math.floor(Math.random() * nodePositions[nextLIdx].length)];
          p.to = nodePositions[nextLIdx + 1][Math.floor(Math.random() * nodePositions[nextLIdx + 1].length)];
        }
        p.mesh.position.lerpVectors(p.from, p.to, p.progress);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activationSpeed]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-[#0f111e] p-6 rounded-2xl border border-[#22263d]">
      <div className="w-full lg:w-2/3 h-[420px] rounded-xl overflow-hidden relative border border-[#22263d]" ref={mountRef}>
        <div className="absolute top-3 left-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono text-slate-300">
          Feedforward Deep Neural Network: Input (11) → Hidden (8×6) → Output (3)
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Inputs</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> Hidden ReLUs</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Softmax Quality</div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-semibold text-white">Multi-Layer Perceptron (MLP)</h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">Deep Learning</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Multi-Layer Perceptron passes feature activations forward through weighted synaptic connections and non-linear activation functions (ReLU), backpropagating gradients during training.
          </p>

          <div className="space-y-4 bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Feedforward Pulse Speed:</span>
                <span className="text-cyan-400 font-bold">{activationSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={activationSpeed}
                onChange={(e) => setActivationSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="text-xs font-mono space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-[#22263d] pb-1">
                <span className="text-slate-400">Input Layer:</span>
                <span className="text-cyan-300">11 Physicochemical Features</span>
              </div>
              <div className="flex justify-between border-b border-[#22263d] pb-1">
                <span className="text-slate-400">Hidden Architecture:</span>
                <span className="text-violet-300">Layer 1 (64) → Layer 2 (32)</span>
              </div>
              <div className="flex justify-between border-b border-[#22263d] pb-1">
                <span className="text-slate-400">Activation Function:</span>
                <span className="text-emerald-300">ReLU (Rectified Linear)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output Layer:</span>
                <span className="text-pink-300">Discrete Quality Classes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#15182a] p-3 rounded-xl border border-[#22263d] text-xs text-slate-400">
          <span className="text-violet-300 font-mono font-medium block mb-1">💡 Architecture Tip:</span>
          Deep networks require standard scaling (Z-score normalization) to prevent vanishing or exploding gradients during backpropagation.
        </div>
      </div>
    </div>
  );
};
