import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const KMeansClusterVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [numClusters, setNumClusters] = useState<number>(3);
  const [iteration, setIteration] = useState<number>(1);

  const updateClustersRef = useRef<((k: number) => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e1a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(14, 14, 0x3b4263, 0x1e2337);
    grid.position.y = -3;
    scene.add(grid);

    const clusterColors = [0x38bdf8, 0xa855f7, 0x10b981, 0xf59e0b];
    const pointsGroup = new THREE.Group();
    const centroidsGroup = new THREE.Group();
    scene.add(pointsGroup);
    scene.add(centroidsGroup);

    // Generate 90 data points
    const dataPoints: { pos: THREE.Vector3; mesh: THREE.Mesh; clusterIdx: number }[] = [];
    const ptGeo = new THREE.SphereGeometry(0.18, 12, 12);

    const naturalCenters = [
      new THREE.Vector3(-3, 0, -2),
      new THREE.Vector3(2, 1, 1),
      new THREE.Vector3(0, -1, 3),
      new THREE.Vector3(3, -1, -3)
    ];

    for (let c = 0; c < 4; c++) {
      for (let i = 0; i < 25; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 3
        );
        const pos = naturalCenters[c].clone().add(offset);
        const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3 });
        const mesh = new THREE.Mesh(ptGeo, mat);
        mesh.position.copy(pos);
        pointsGroup.add(mesh);
        dataPoints.push({ pos, mesh, clusterIdx: 0 });
      }
    }

    // Centroids
    interface Centroid {
      pos: THREE.Vector3;
      targetPos: THREE.Vector3;
      mesh: THREE.Mesh;
    }
    let centroids: Centroid[] = [];
    const centroidGeo = new THREE.OctahedronGeometry(0.45, 0);

    const initCentroids = (k: number) => {
      // Clear centroids
      while (centroidsGroup.children.length > 0) {
        centroidsGroup.remove(centroidsGroup.children[0]);
      }
      centroids = [];

      for (let i = 0; i < k; i++) {
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 8
        );
        const mat = new THREE.MeshStandardMaterial({
          color: clusterColors[i],
          emissive: clusterColors[i],
          emissiveIntensity: 0.6
        });
        const mesh = new THREE.Mesh(centroidGeo, mat);
        mesh.position.copy(pos);
        centroidsGroup.add(mesh);
        centroids.push({ pos, targetPos: pos.clone(), mesh });
      }

      // Assign points to closest centroid
      dataPoints.forEach(pt => {
        let minDist = Infinity;
        let bestC = 0;
        centroids.forEach((c, idx) => {
          const d = pt.pos.distanceTo(c.pos);
          if (d < minDist) {
            minDist = d;
            bestC = idx;
          }
        });
        pt.clusterIdx = bestC;
        (pt.mesh.material as THREE.MeshStandardMaterial).color.setHex(clusterColors[bestC]);
      });
    };

    updateClustersRef.current = initCentroids;
    initCentroids(numClusters);

    // Animation Loop
    let angle = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.003;

      camera.position.x = Math.sin(angle) * 14;
      camera.position.z = Math.cos(angle) * 14;
      camera.lookAt(0, 0, 0);

      // Centroids pulse/rotate
      centroids.forEach(c => {
        c.mesh.rotation.y += 0.02;
        c.mesh.rotation.x += 0.01;
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

  const handleKChange = (k: number) => {
    setNumClusters(k);
    if (updateClustersRef.current) {
      updateClustersRef.current(k);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-[#0f111e] p-6 rounded-2xl border border-[#22263d]">
      <div className="w-full lg:w-2/3 h-[420px] rounded-xl overflow-hidden relative border border-[#22263d]" ref={mountRef}>
        <div className="absolute top-3 left-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono text-slate-300">
          3D Unsupervised Cluster Partitioning: K={numClusters} Centroids
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-[#080911]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Cluster A</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> Cluster B</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Cluster C</div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-semibold text-white">Interactive K-Means Clustering</h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">Unsupervised</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            K-Means partitions observations into K clusters where each observation belongs to the cluster with the nearest mean centroid, minimizing within-cluster sum of squares (WCSS).
          </p>

          <div className="space-y-4 bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Number of Clusters (K):</span>
                <span className="text-emerald-400 font-bold">{numClusters}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map(k => (
                  <button
                    key={k}
                    onClick={() => handleKChange(k)}
                    className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${numClusters === k ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-[#0f111e] text-slate-400 border border-[#22263d]'}`}
                  >
                    K = {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-[#22263d] pb-1">
                <span className="text-slate-400">Objective:</span>
                <span className="text-cyan-300">Min WCSS (Inertia)</span>
              </div>
              <div className="flex justify-between border-b border-[#22263d] pb-1">
                <span className="text-slate-400">Convergence:</span>
                <span className="text-violet-300">Lloyd's Algorithm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Optimal K Heuristic:</span>
                <span className="text-emerald-300">Elbow / Silhouette Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#15182a] p-3 rounded-xl border border-[#22263d] text-xs text-slate-400">
          <span className="text-emerald-300 font-mono font-medium block mb-1">💡 Physicochemical Note:</span>
          In wine chemistry, unsupervised clustering groups wines with similar acid-to-sugar-to-alcohol profiles without pre-assigned human quality labels.
        </div>
      </div>
    </div>
  );
};
