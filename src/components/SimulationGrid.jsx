import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulationState } from '../hooks/useSimulationState';
import { useGameLoop } from '../hooks/useGameLoop';
import { updateGrid, initializeRandomInfections } from '../utils/simulationEngine';
import './SimulationGrid.css';

const SimulationGrid = () => {
  const canvasRef = useRef(null);
  const { 
    grid, 
    setGrid, 
    simulationParams, 
    statistics, 
    updateStatistics,
    resetSimulation 
  } = useSimulationState();
  
  const { isRunning, startSimulation, stopSimulation, gameLoop } = useGameLoop();

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Initial render
    renderGrid(ctx, grid);
  }, [grid]);

  // Render function
  const renderGrid = useCallback((ctx, currentGrid) => {
    const cellSize = 4;
    const cols = Math.floor(ctx.canvas.width / cellSize);
    const rows = Math.floor(ctx.canvas.height / cellSize);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = currentGrid[y]?.[x];
        if (cell) {
          const color = getCellColor(cell);
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, []);

  // Get color based on cell state
  const getCellColor = (cell) => {
    switch (cell.state) {
      case 'healthy':
        return '#4ade80'; // Green
      case 'infected':
        return '#ef4444'; // Red
      case 'recovered':
        return '#3b82f6'; // Blue
      case 'dead':
        return '#1f2937'; // Dark gray/black
      default:
        return '#ffffff'; // White
    }
  };

  // Handle canvas click for placing initial infections
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 4);
    const y = Math.floor((e.clientY - rect.top) / 4);
    
    if (grid[y]?.[x]?.state === 'healthy') {
      const newGrid = [...grid];
      newGrid[y][x] = { 
        state: 'infected', 
        infectionTime: 0,
        variant: 'alpha'
      };
      setGrid(newGrid);
    }
  }, [grid, setGrid]);

  // Simulation update function
  const updateSimulation = useCallback(() => {
    if (!isRunning) return;
    
    const newGrid = updateGrid(grid, simulationParams);
    setGrid(newGrid);
    updateStatistics(newGrid);
  }, [isRunning, grid, simulationParams, setGrid, updateStatistics]);

  // Start the game loop when simulation is running
  useEffect(() => {
    if (isRunning) {
      gameLoop(0, updateSimulation);
    }
  }, [isRunning, gameLoop, updateSimulation]);

  // Initialize random infections
  const handleRandomInfections = useCallback(() => {
    const newGrid = initializeRandomInfections(grid, 20);
    setGrid(newGrid);
  }, [grid, setGrid]);

  return (
    <div className="simulation-grid">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="simulation-canvas"
      />
      <div className="simulation-controls">
        <button onClick={isRunning ? stopSimulation : startSimulation}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={handleRandomInfections}>
          Random Infections
        </button>
        <button onClick={resetSimulation}>
          Reset
        </button>
      </div>
      <div className="simulation-stats">
        <div>Frame: {statistics.frame}</div>
        <div>Healthy: {statistics.healthy}</div>
        <div>Infected: {statistics.infected}</div>
        <div>Recovered: {statistics.recovered}</div>
        <div>Dead: {statistics.dead}</div>
        <div>R-Value: {statistics.rValue}</div>
      </div>
    </div>
  );
};

export default SimulationGrid; 