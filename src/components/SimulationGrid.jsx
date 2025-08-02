import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulationState } from '../hooks/useSimulationState';
import { useGameLoop } from '../hooks/useGameLoop';
import './SimulationGrid.css';

const SimulationGrid = () => {
  const canvasRef = useRef(null);
  const { grid, setGrid, simulationParams } = useSimulationState();
  const { isRunning, startSimulation, stopSimulation } = useGameLoop();

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
      </div>
    </div>
  );
};

export default SimulationGrid; 