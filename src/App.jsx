import React from 'react';
import SimulationGrid from './components/SimulationGrid';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Outbreak Automata</h1>
        <p>Epidemiological Simulation Game</p>
      </header>
      <main className="app-main">
        <SimulationGrid />
      </main>
    </div>
  );
}

export default App;
