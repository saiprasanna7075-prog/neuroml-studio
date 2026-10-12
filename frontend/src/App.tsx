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
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);
  const [arenaRfId, setArenaRfId] = useState<string | undefined>();
  const [arenaKnnId, setArenaKnnId] = useState<string | undefined>();

  useEffect(() => {
    const checkBackend = () => {
      fetchHealth()
        .then(() => setBackendHealthy(true))
        .catch(() => setBackendHealthy(false));
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
    <div className="min-h-screen bg-[#080911] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDatasetName="UCI Wine Quality"
        backendHealthy={backendHealthy}
      />

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex w-full">
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
