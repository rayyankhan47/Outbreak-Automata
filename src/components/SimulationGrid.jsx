import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useSimulationState } from '../hooks/useSimulationState';
import { useGameLoop } from '../hooks/useGameLoop';
import { updateGrid, initializeRandomInfections, applyIntervention } from '../utils/simulationEngine';
import './SimulationGrid.css';

const SimulationGrid = ({ selectedTool, onInterventionComplete }) => {
  const canvasRef = useRef(null);
  
  const { 
    grid, 
    setGrid, 
    simulationParams, 
    statistics, 
    updateStatistics,
    resetSimulation 
  } = useSimulationState();
  
  const { isRunning, startSimulation, stopSimulation, gameLoop, updateSimulationSpeed } = useGameLoop();

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

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = currentGrid[y]?.[x];
        if (cell) {
          const color = getCellColor(cell, simulationParams);
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          
          // Draw intervention indicators
          if (cell.intervention) {
            drawInterventionIndicator(ctx, x * cellSize, y * cellSize, cellSize, cell.intervention);
          }
          
          // Draw progress indicators for infected cells
          if (cell.state === 'infected') {
            drawProgressIndicator(ctx, x * cellSize, y * cellSize, cellSize, cell.infectionTime, simulationParams.infectionDuration);
          }
        }
        // Empty spaces remain white (transparent)
      }
    }
  }, [simulationParams]);

  // Get color based on cell state with progress indication
  const getCellColor = (cell, params) => {
    switch (cell.state) {
      case 'healthy':
        return '#4ade80'; // Green
      case 'infected':
        // Make infected cells darker as they progress
        const progress = cell.infectionTime / params.infectionDuration;
        const intensity = Math.max(0.3, 1 - progress * 0.5);
        return `rgba(239, 68, 68, ${intensity})`; // Red with varying opacity
      case 'recovered':
        return '#3b82f6'; // Blue
      case 'dead':
        return '#1f2937'; // Dark gray/black
      default:
        return '#ffffff'; // White
    }
  };

  // Draw progress indicator for infected cells
  const drawProgressIndicator = (ctx, x, y, size, currentTime, maxTime) => {
    const progress = currentTime / maxTime;
    const barHeight = 1;
    const barWidth = size * progress;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y + size - barHeight, barWidth, barHeight);
  };

  // Draw intervention indicators
  const drawInterventionIndicator = (ctx, x, y, size, intervention) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    switch (intervention) {
      case 'vaccinated':
        // Draw a small cross
        ctx.beginPath();
        ctx.moveTo(x + size * 0.3, y + size * 0.3);
        ctx.lineTo(x + size * 0.7, y + size * 0.7);
        ctx.moveTo(x + size * 0.7, y + size * 0.3);
        ctx.lineTo(x + size * 0.3, y + size * 0.7);
        ctx.stroke();
        break;
        
      case 'quarantine':
        // Draw a border
        ctx.strokeRect(x, y, size, size);
        break;
        
      case 'hospital':
        // Draw a plus sign
        ctx.beginPath();
        ctx.moveTo(x + size * 0.5, y + size * 0.2);
        ctx.lineTo(x + size * 0.5, y + size * 0.8);
        ctx.moveTo(x + size * 0.2, y + size * 0.5);
        ctx.lineTo(x + size * 0.8, y + size * 0.5);
        ctx.stroke();
        break;
        
      default:
        break;
    }
  };

  // Handle canvas click for placing initial infections or interventions
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 4);
    const y = Math.floor((e.clientY - rect.top) / 4);
    
    if (selectedTool) {
      // Apply intervention
      const newGrid = applyIntervention(grid, selectedTool, x, y);
      setGrid(newGrid);
      if (onInterventionComplete) {
        onInterventionComplete();
      }
    } else {
      // Handle infection placement
      const newGrid = [...grid];
      const cell = newGrid[y]?.[x];
      
      if (cell && cell.state === 'healthy') {
        // Click on healthy person - infect them
        newGrid[y][x] = { 
          state: 'infected', 
          infectionTime: 0,
          variant: 'alpha'
        };
        setGrid(newGrid);
      } else if (!cell) {
        // Click on empty space - place new infected person
        newGrid[y][x] = { 
          state: 'infected', 
          infectionTime: 0,
          variant: 'alpha'
        };
        setGrid(newGrid);
      }
      // Click on infected/recovered/dead person - no effect
    }
  }, [grid, setGrid, selectedTool, onInterventionComplete]);

  // Simulation update function
  const updateSimulation = useCallback(() => {
    if (!isRunning) return;
    
    const newGrid = updateGrid(grid, simulationParams);
    setGrid(newGrid);
    updateStatistics(newGrid);
  }, [isRunning, grid, simulationParams, setGrid, updateStatistics]);

  // Set up the game loop with simulation speed
  useEffect(() => {
    gameLoop(updateSimulation, simulationParams.simulationSpeed);
  }, [gameLoop, updateSimulation, simulationParams.simulationSpeed]);

  // Update simulation speed in real-time when it changes
  useEffect(() => {
    updateSimulationSpeed(simulationParams.simulationSpeed);
  }, [simulationParams.simulationSpeed, updateSimulationSpeed]);

  // Initialize random infections
  const handleRandomInfections = useCallback(() => {
    const newGrid = initializeRandomInfections(grid, 20);
    setGrid(newGrid);
  }, [grid, setGrid]);

  // Enhanced start simulation with automatic infections if none exist
  const handleStartSimulation = useCallback(() => {
    // Check if there are any infected cells
    let hasInfected = false;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] && grid[y][x].state === 'infected') {
          hasInfected = true;
          break;
        }
      }
      if (hasInfected) break;
    }
    
    // If no infections exist, add some random ones
    if (!hasInfected) {
      const newGrid = initializeRandomInfections(grid, 15);
      setGrid(newGrid);
    }
    
    startSimulation();
  }, [grid, setGrid, startSimulation]);

  return (
    <div className="simulation-grid">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`simulation-canvas ${selectedTool ? 'tool-selected' : ''}`}
      />
      <div className="simulation-controls">
        <button onClick={isRunning ? stopSimulation : handleStartSimulation}>
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
      <div className="simulation-legend">
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#4ade80'}}></div>
          <span>Healthy</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
          <span>Infected (progress bar shows time remaining)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
          <span>Recovered (immune)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#1f2937'}}></div>
          <span>Dead</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationGrid; 