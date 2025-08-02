import React from 'react';
import SimulationGrid from './components/SimulationGrid';
import ControlPanel from './components/ControlPanel';
import { useSimulationState } from './hooks/useSimulationState';
import './App.css';

function App() {
  const { simulationParams, updateParams } = useSimulationState();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Outbreak Automata</h1>
        <p>Epidemiological Simulation Game</p>
      </header>
      <main className="app-main">
        <div className="app-content">
          <SimulationGrid />
          <ControlPanel 
            simulationParams={simulationParams}
            updateParams={updateParams}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
