import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { WineQualityPage } from './pages/WineQualityPage';
import { AlgorithmUniversePage } from './pages/AlgorithmUniversePage';
import { AlgorithmExplorerPage } from './pages/AlgorithmExplorerPage';
import { ModelArenaPage } from './pages/ModelArenaPage';
import { ExplainableAiPage } from './pages/ExplainableAiPage';
import { DataStudioPage } from './pages/DataStudioPage';
import { PredictionPlaygroundPage } from './pages/PredictionPlaygroundPage';
import { CustomWorkspacePage } from './pages/CustomWorkspacePage';
import { DemonstrationModePage } from './pages/DemonstrationModePage';
import { LearnModePage } from './pages/LearnModePage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { fetchHealth } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const [engineMode, setEngineMode] = useState<'python' | 'cloud'>('cloud');
  const [arenaRfId, setArenaRfId] = useState<string | undefined>();
  const [arenaKnnId, setArenaKnnId] = useState<string | undefined>();

  useEffect(() => {
    const checkBackend = () => {
      fetchHealth()
        .then((res: any) => {
          setBackendHealthy(true);
          setEngineMode(res?.mode === 'python' ? 'python' : 'cloud');
        })
        .catch(() => {
          setBackendHealthy(true);
          setEngineMode('cloud');
        });
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToArena = (rfId: string, knnId: string) => {
    setArenaRfId(rfId);
    setArenaKnnId(knnId);
    setActiveTab('arena');
  };

  return (
    <div className="relative min-h-screen bg-[#07080e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Ambient Cyber Mesh Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-violet-600/10 blur-[130px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[150px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-30">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeDatasetName="UCI Wine Quality"
          backendHealthy={backendHealthy}
          engineMode={engineMode}
        />
      </div>

      {/* Main Content with Sidebar */}
      <div className="relative z-10 flex-1 flex w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {activeTab === 'overview' && (
            <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'wine' && (
            <WineQualityPage
              onNavigateToArena={handleNavigateToArena}
              onNavigateToPredict={() => setActiveTab('predict')}
            />
          )}

          {activeTab === 'algorithms' && (
            <AlgorithmUniversePage
              onTrainModel={() => setActiveTab('wine')}
              onLearnMore={() => setActiveTab('learn')}
            />
          )}

          {activeTab === 'explorer' && <AlgorithmExplorerPage />}

          {activeTab === 'arena' && (
            <ModelArenaPage initialRfId={arenaRfId} initialKnnId={arenaKnnId} />
          )}

          {activeTab === 'shap' && <ExplainableAiPage />}

          {activeTab === 'datastudio' && <DataStudioPage />}

          {activeTab === 'predict' && <PredictionPlaygroundPage />}

          {activeTab === 'workspace' && <CustomWorkspacePage />}

          {activeTab === 'demo' && <DemonstrationModePage />}

          {activeTab === 'learn' && <LearnModePage />}

          {activeTab === 'history' && <ExperimentsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
