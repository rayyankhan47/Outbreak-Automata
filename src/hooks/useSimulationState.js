import { useState, useCallback, useMemo } from 'react';

// Initialize empty grid
const createEmptyGrid = (rows = 150, cols = 200) => {
  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = {
        state: 'healthy',
        infectionTime: 0,
        immunityTime: 0,
        variant: null
      };
    }
  }
  return grid;
};

export const useSimulationState = () => {
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [simulationParams, setSimulationParams] = useState({
    transmissionRate: 2, // Number of infected neighbors needed
    infectionDuration: 50, // Frames before recovery/death
    recoveryRate: 0.8, // Probability of recovery vs death
    immunityDuration: 100, // Frames of immunity
    mortalityRate: 0.2, // Probability of death when infected
  });

  const [statistics, setStatistics] = useState({
    healthy: 0,
    infected: 0,
    recovered: 0,
    dead: 0,
    total: 0,
    rValue: 0,
    frame: 0
  });

  // Update statistics based on current grid
  const updateStatistics = useCallback((currentGrid) => {
    let healthy = 0, infected = 0, recovered = 0, dead = 0;
    
    for (let y = 0; y < currentGrid.length; y++) {
      for (let x = 0; x < currentGrid[y].length; x++) {
        const cell = currentGrid[y][x];
        switch (cell.state) {
          case 'healthy':
            healthy++;
            break;
          case 'infected':
            infected++;
            break;
          case 'recovered':
            recovered++;
            break;
          case 'dead':
            dead++;
            break;
        }
      }
    }

    const total = healthy + infected + recovered + dead;
    const rValue = infected > 0 ? (infected / total) * simulationParams.transmissionRate : 0;

    setStatistics({
      healthy,
      infected,
      recovered,
      dead,
      total,
      rValue: rValue.toFixed(2),
      frame: statistics.frame + 1
    });
  }, [simulationParams.transmissionRate, statistics.frame]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setGrid(createEmptyGrid());
    setStatistics({
      healthy: 0,
      infected: 0,
      recovered: 0,
      dead: 0,
      total: 0,
      rValue: 0,
      frame: 0
    });
  }, []);

  // Update simulation parameters
  const updateParams = useCallback((newParams) => {
    setSimulationParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    grid,
    setGrid,
    simulationParams,
    statistics,
    updateStatistics,
    resetSimulation,
    updateParams
  };
}; 