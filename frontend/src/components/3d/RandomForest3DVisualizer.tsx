import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const RandomForest3DVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [numTrees, setNumTrees] = useState<number>(7);
  const [selectedTree, setSelectedTree] = useState<number>(0);
  const [ensembleVote, setEnsembleVote] = useState<{ [cls: number]: number }>({ 5: 1, 6: 5, 7: 1 });
  const [ensembleResult, setEnsembleResult] = useState<number>(6);

  const rebuildForestRef = useRef<((trees: number) => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e1a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 8);
    scene.add(dirLight);

    // Forest group
    const forestGroup = new THREE.Group();
    scene.add(forestGroup);

    // Central Aggregation Hub
    const hubGeo = new THREE.OctahedronGeometry(1.2, 0);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.position.set(0, 0, 0);
    forestGroup.add(hubMesh);

    const hubWire = new THREE.Mesh(
      hubGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
    );
    hubWire.scale.setScalar(1.05);
    hubMesh.add(hubWire);

    // Dynamic pulses traveling from trees to central hub
    interface Pulse {
      mesh: THREE.Mesh;
      from: THREE.Vector3;
      to: THREE.Vector3;
      progress: number;
      speed: number;
    }
    const pulseGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    let pulses: Pulse[] = [];

    const rebuildForest = (treeCount: number) => {
      // Remove previous trees
      pulses = [];
      while (forestGroup.children.length > 1) {
        forestGroup.remove(forestGroup.children[forestGroup.children.length - 1]);
      }

      const radius = 5.5;
      const votes: { [cls: number]: number } = { 5: 0, 6: 0, 7: 0 };

      for (let t = 0; t < treeCount; t++) {
        const angle = (t / treeCount) * Math.PI * 2;
        const tx = Math.sin(angle) * radius;
        const tz = Math.cos(angle) * radius;
        const treeRoot = new THREE.Vector3(tx, -1.5, tz);

        const treeGroup = new THREE.Group();
        treeGroup.position.copy(treeRoot);

        // Build a 3D branching binary decision tree
        // Levels: Root (lvl 0) -> 2 nodes (lvl 1) -> 4 leaf nodes (lvl 2)
        const nodeGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const nodeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.4 });
        const branchMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 });

        // Root
        const rootMesh = new THREE.Mesh(nodeGeo, nodeMat);
        rootMesh.position.set(0, 2.5, 0);
        treeGroup.add(rootMesh);

        // Level 1 nodes
        const l1Positions = [
          new THREE.Vector3(-0.7, 1.3, 0),
          new THREE.Vector3(0.7, 1.3, 0)
        ];
        l1Positions.forEach(pos => {
          const m = new THREE.Mesh(nodeGeo, nodeMat);
          m.position.copy(pos);
          treeGroup.add(m);

          const branch = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([rootMesh.position, pos]),
            branchMat
          );
          treeGroup.add(branch);
        });

        // Level 2 (Leaves) with individual tree prediction
        const assignedClass = t % 5 === 0 ? 5 : t % 7 === 0 ? 7 : 6;
        votes[assignedClass] = (votes[assignedClass] || 0) + 1;

        const leafColor = assignedClass === 5 ? 0xf43f5e : assignedClass === 6 ? 0x38bdf8 : 0x10b981;
        const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, emissive: leafColor, emissiveIntensity: 0.6 });

        const l2Positions = [
          new THREE.Vector3(-1.1, 0.1, 0),
          new THREE.Vector3(-0.3, 0.1, 0),
          new THREE.Vector3(0.3, 0.1, 0),
          new THREE.Vector3(1.1, 0.1, 0)
        ];
        l2Positions.forEach((pos, idx) => {
          const parentPos = l1Positions[Math.floor(idx / 2)];
          const m = new THREE.Mesh(nodeGeo, idx === (t % 4) ? leafMat : nodeMat);
          m.position.copy(pos);
          treeGroup.add(m);

          const branch = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([parentPos, pos]),
            branchMat
          );
          treeGroup.add(branch);
        });

        // Connection line to central aggregation hub
        const lineToHub = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.5, 0).add(treeRoot)]),
          new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 })
        );
        forestGroup.add(lineToHub);
        forestGroup.add(treeGroup);

        // Pulse packet
        const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
        pMesh.position.copy(treeRoot);
        forestGroup.add(pMesh);

        pulses.push({
          mesh: pMesh,
          from: treeRoot.clone().add(new THREE.Vector3(0, 1.5, 0)),
          to: new THREE.Vector3(0, 0, 0),
          progress: (t / treeCount),
          speed: 0.008 + Math.random() * 0.004
        });
      }

      setEnsembleVote(votes);

      let winner = 6;
      let maxV = -1;
      for (const [cls, cnt] of Object.entries(votes)) {
        if (cnt > maxV) {
          maxV = cnt;
          winner = Number(cls);
        }
      }
      setEnsembleResult(winner);
    };

    rebuildForestRef.current = rebuildForest;
    rebuildForest(numTrees);

    // Animation Loop
    let angle = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.002;

      // Rotate whole forest gently
      forestGroup.rotation.y = angle;

      // Rotate Hub
      hubMesh.rotation.y = -angle * 2;
      hubMesh.rotation.x = Math.sin(angle * 2) * 0.3;

      // Pulse data flow
      pulses.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) p.progress = 0;
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
  }, []);

  const handleTreeCountChange = (count: number) => {
    setNumTrees(count);
    if (rebuildForestRef.current) {
      rebuildForestRef.current(count);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-[#0f111e] p-6 rounded-2xl border border-[#22263d]">
      <div className="w-full lg:w-2/3 h-[420px] rounded-xl overflow-hidden relative border border-[#22263d]" ref={mountRef}>
        <div className="absolute top-3 left-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono text-slate-300">
          3D Ensemble Forest: {numTrees} Decision Trees → Central Aggregation Core
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Central Hub</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Tree Nodes</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Prediction Pulses</div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-semibold text-white">Interactive Random Forest</h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">Bagging Ensemble</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Random Forest constructs a collection of de-correlated decision trees using bootstrap sampling and random feature subsets, reducing variance while maintaining low bias.
          </p>

          <div className="space-y-4 bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Ensemble Tree Count:</span>
                <span className="text-violet-400 font-bold">{numTrees} Trees</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="2"
                value={numTrees}
                onChange={(e) => handleTreeCountChange(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>3 Trees (Fast)</span>
                <span>15 Trees (Stable Ensemble)</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-[#0f111e] p-3 rounded-lg border border-[#22263d]/60 font-mono">
              <div className="text-slate-400">Aggregation Mechanism:</div>
              <div className="text-cyan-300">• Classification: Plurality (Majority) Voting</div>
              <div className="text-violet-300">• Regression: Arithmetic Mean Average</div>
            </div>
          </div>
        </div>

        <div className="bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
          <span className="text-xs font-mono text-slate-400 block mb-2">Ensemble Vote Tally:</span>
          <div className="space-y-1.5 mb-3 font-mono text-xs">
            {Object.entries(ensembleVote).map(([cls, count]) => (
              <div key={cls} className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cls === '5' ? 'bg-rose-500' : cls === '6' ? 'bg-sky-400' : 'bg-emerald-500'}`} />
                  Quality Score {cls}:
                </span>
                <span className="text-white font-bold">{count} trees ({Math.round((count / numTrees) * 100)}%)</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-[#22263d] flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">Ensemble Consensus:</span>
            <span className="text-sm font-bold text-violet-300 font-mono bg-violet-950/60 px-3 py-1 rounded-md border border-violet-500/30">
              Wine Quality {ensembleResult}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
