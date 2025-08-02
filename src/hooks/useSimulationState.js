import { useState, useCallback, useMemo } from 'react';

// Initialize grid with population density
const createEmptyGrid = (rows = 150, cols = 200, populationDensity = 0.3) => {
  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      // Randomly place people based on population density
      if (Math.random() < populationDensity) {
        grid[y][x] = {
          state: 'healthy',
          infectionTime: 0,
          immunityTime: 0,
          variant: null
        };
      } else {
        // Empty space
        grid[y][x] = null;
      }
    }
  }
  return grid;
};

export const useSimulationState = () => {
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [simulationParams, setSimulationParams] = useState({
    transmissionRate: 1, // Number of infected neighbors needed
    infectionDuration: 30, // Frames before recovery/death
    recoveryRate: 0.7, // Probability of recovery vs death
    immunityDuration: 80, // Frames of immunity
    mortalityRate: 0.3, // Probability of death when infected
    populationDensity: 0.3, // Percentage of cells that contain people (0.1 to 0.8)
    simulationSpeed: 1.0, // Speed multiplier (0.1 to 5.0)
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
        if (cell) { // Only count cells that contain people
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

  // Reset simulation with current population density
  const resetSimulation = useCallback(() => {
    setGrid(createEmptyGrid(150, 200, simulationParams.populationDensity));
    setStatistics({
      healthy: 0,
      infected: 0,
      recovered: 0,
      dead: 0,
      total: 0,
      rValue: 0,
      frame: 0
    });
  }, [simulationParams.populationDensity]);

  // Update simulation parameters
  const updateParams = useCallback((newParams) => {
    setSimulationParams(prev => ({ ...prev, ...newParams }));
    
    // If population density changed, regenerate the grid
    if (newParams.populationDensity !== undefined) {
      setGrid(createEmptyGrid(150, 200, newParams.populationDensity));
    }
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