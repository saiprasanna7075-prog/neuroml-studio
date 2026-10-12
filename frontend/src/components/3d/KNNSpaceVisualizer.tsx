import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const KNNSpaceVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [kValue, setKValue] = useState<number>(5);
  const [distanceMetric, setDistanceMetric] = useState<'euclidean' | 'manhattan'>('euclidean');
  const [predictedClass, setPredictedClass] = useState<number>(6);
  const [neighborCounts, setNeighborCounts] = useState<{ [cls: number]: number }>({ 5: 1, 6: 3, 7: 1 });

  // Store update callback for animation
  const updateKNNRef = useRef<((k: number, metric: 'euclidean' | 'manhattan') => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e1a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid and axes
    const grid = new THREE.GridHelper(16, 16, 0x3b4263, 0x1e2337);
    grid.position.y = -3;
    scene.add(grid);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    // Generate 120 synthetic data points across 3 wine classes (5, 6, 7)
    interface PointData {
      pos: THREE.Vector3;
      cls: number;
      mesh: THREE.Mesh;
    }

    const classColors: { [cls: number]: number } = {
      5: 0xf43f5e, // Rose Red
      6: 0x38bdf8, // Sky Cyan
      7: 0x10b981  // Emerald
    };

    const points: PointData[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);

    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    };
    const rand = rng(42);

    // Centers for 3 clusters
    const centers = [
      { cls: 5, center: new THREE.Vector3(-3, 0, -2) },
      { cls: 6, center: new THREE.Vector3(1, 1, 1) },
      { cls: 7, center: new THREE.Vector3(3.5, 2, -1) }
    ];

    centers.forEach(grp => {
      for (let i = 0; i < 40; i++) {
        const offset = new THREE.Vector3(
          (rand() - 0.5) * 4.5,
          (rand() - 0.5) * 3.5,
          (rand() - 0.5) * 4.5
        );
        const pos = grp.center.clone().add(offset);
        const mat = new THREE.MeshStandardMaterial({
          color: classColors[grp.cls],
          roughness: 0.3
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.copy(pos);
        scene.add(mesh);
        points.push({ pos, cls: grp.cls, mesh });
      }
    });

    // Query Point (Yellow target)
    const queryGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const queryMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.6
    });
    const queryMesh = new THREE.Mesh(queryGeo, queryMat);
    const queryPos = new THREE.Vector3(0.5, 0.8, 0);
    queryMesh.position.copy(queryPos);
    scene.add(queryMesh);

    // Group for neighbor connection lines and highlight rings
    const connectionsGroup = new THREE.Group();
    scene.add(connectionsGroup);

    // Update KNN function
    const updateKNN = (k: number, metric: 'euclidean' | 'manhattan') => {
      // Clear old lines
      while (connectionsGroup.children.length > 0) {
        const obj = connectionsGroup.children[0];
        connectionsGroup.remove(obj);
      }

      // Reset all point scales & emissives
      points.forEach(p => {
        p.mesh.scale.setScalar(1.0);
        (p.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      });

      // Calculate distances
      const distances = points.map(p => {
        let dist = 0;
        if (metric === 'euclidean') {
          dist = queryPos.distanceTo(p.pos);
        } else {
          dist = Math.abs(queryPos.x - p.pos.x) + Math.abs(queryPos.y - p.pos.y) + Math.abs(queryPos.z - p.pos.z);
        }
        return { point: p, dist };
      });

      distances.sort((a, b) => a.dist - b.dist);
      const kNearest = distances.slice(0, k);

      // Tally class votes
      const votes: { [cls: number]: number } = {};
      kNearest.forEach(n => {
        votes[n.point.cls] = (votes[n.point.cls] || 0) + 1;

        // Highlight neighbor mesh
        n.point.mesh.scale.setScalar(1.6);
        (n.point.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(classColors[n.point.cls]);

        // Draw connecting ray to query sample
        const lineGeo = new THREE.BufferGeometry().setFromPoints([queryPos, n.point.pos]);
        const lineMat = new THREE.LineBasicMaterial({
          color: classColors[n.point.cls],
          linewidth: 2,
          transparent: true,
          opacity: 0.8
        });
        const line = new THREE.Line(lineGeo, lineMat);
        connectionsGroup.add(line);
      });

      setNeighborCounts(votes);

      // Majority vote winner
      let bestClass = 6;
      let maxVotes = -1;
      for (const [clsStr, count] of Object.entries(votes)) {
        if (count > maxVotes) {
          maxVotes = count;
          bestClass = Number(clsStr);
        }
      }
      setPredictedClass(bestClass);
    };

    updateKNNRef.current = updateKNN;
    updateKNN(kValue, distanceMetric);

    // Rotation & Mouse interaction
    let angle = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.003;

      camera.position.x = Math.sin(angle) * 16;
      camera.position.z = Math.cos(angle) * 16;
      camera.lookAt(0, 0, 0);

      // Bob query point slightly
      queryMesh.position.y = 0.8 + Math.sin(angle * 4) * 0.15;

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

  const handleKChange = (newK: number) => {
    setKValue(newK);
    if (updateKNNRef.current) {
      updateKNNRef.current(newK, distanceMetric);
    }
  };

  const handleMetricChange = (metric: 'euclidean' | 'manhattan') => {
    setDistanceMetric(metric);
    if (updateKNNRef.current) {
      updateKNNRef.current(kValue, metric);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-[#0f111e] p-6 rounded-2xl border border-[#22263d]">
      <div className="w-full lg:w-2/3 h-[420px] rounded-xl overflow-hidden relative border border-[#22263d]" ref={mountRef}>
        <div className="absolute top-3 left-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono text-slate-300">
          3D Feature Projection: Alcohol (X) vs Volatile Acidity (Y) vs Sulphates (Z)
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Class 5</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Class 6</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Class 7</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Query Target</div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-semibold text-white">Interactive K-Nearest Neighbors</h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">3D Space</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            KNN classifies an unlabelled observation by computing the distance to all points in the scaled feature space and casting a majority vote among the K closest neighbors.
          </p>

          <div className="space-y-4 bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Number of Neighbors (K):</span>
                <span className="text-cyan-400 font-bold">{kValue}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="2"
                value={kValue}
                onChange={(e) => handleKChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>K=1 (High Variance)</span>
                <span>K=15 (High Bias)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Distance Metric:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMetricChange('euclidean')}
                  className={`py-1.5 text-xs rounded-lg font-mono transition-colors ${distanceMetric === 'euclidean' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-[#0f111e] text-slate-400 border border-[#22263d]'}`}
                >
                  Euclidean (L2)
                </button>
                <button
                  onClick={() => handleMetricChange('manhattan')}
                  className={`py-1.5 text-xs rounded-lg font-mono transition-colors ${distanceMetric === 'manhattan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-[#0f111e] text-slate-400 border border-[#22263d]'}`}
                >
                  Manhattan (L1)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
          <span className="text-xs font-mono text-slate-400 block mb-2">Majority Vote Breakdown:</span>
          <div className="space-y-1.5 mb-3 font-mono text-xs">
            {Object.entries(neighborCounts).map(([cls, count]) => (
              <div key={cls} className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cls === '5' ? 'bg-rose-500' : cls === '6' ? 'bg-sky-400' : 'bg-emerald-500'}`} />
                  Quality Score {cls}:
                </span>
                <span className="text-white font-bold">{count} votes ({Math.round((count / kValue) * 100)}%)</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-[#22263d] flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">KNN Prediction:</span>
            <span className="text-sm font-bold text-cyan-400 font-mono bg-cyan-950/60 px-3 py-1 rounded-md border border-cyan-500/30">
              Wine Quality {predictedClass}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
