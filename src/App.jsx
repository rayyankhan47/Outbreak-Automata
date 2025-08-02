import React, { useState } from 'react';
import SimulationGrid from './components/SimulationGrid';
import ControlPanel from './components/ControlPanel';
import InterventionTools from './components/InterventionTools';
import { useSimulationState } from './hooks/useSimulationState';
import './App.css';

function App() {
  const { simulationParams, updateParams, grid, setGrid } = useSimulationState();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const handleIntervention = (interventionType, x, y) => {
    // This will be handled by the SimulationGrid component
    // We just need to pass the state
  };

  const handleInterventionComplete = () => {
    setSelectedTool(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Outbreak Automata</h1>
        <p>Epidemiological Simulation Game</p>
      </header>
      <main className="app-main">
        <div className="app-content">
          <div className="left-panel">
            <SimulationGrid 
              selectedTool={selectedTool}
              onInterventionComplete={handleInterventionComplete}
            />
          </div>
          <div className="right-panel">
            <ControlPanel 
              simulationParams={simulationParams}
              updateParams={updateParams}
            />
            <InterventionTools 
              onIntervention={handleIntervention}
              isRunning={isRunning}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
