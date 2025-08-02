// Core simulation engine for Outbreak Automata

// Count infected neighbors for a given cell
export const countInfectedNeighbors = (grid, x, y) => {
  let count = 0;
  
  // Check all 8 neighbors (Moore neighborhood)
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue; // Skip the cell itself
      
      const ny = y + dy;
      const nx = x + dx;
      
      // Check bounds
      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[ny].length) {
        if (grid[ny][nx]?.state === 'infected') {
          count++;
        }
      }
    }
  }
  
  return count;
};

// Update a single cell based on simulation rules
export const updateCell = (cell, infectedNeighbors, params) => {
  const newCell = { ...cell };
  
  switch (cell.state) {
    case 'healthy':
      // Become infected if enough infected neighbors
      if (infectedNeighbors >= params.transmissionRate) {
        newCell.state = 'infected';
        newCell.infectionTime = 0;
        newCell.variant = 'alpha'; // Default variant
      }
      break;
      
    case 'infected':
      // Progress infection timer
      newCell.infectionTime++;
      
      // Check if infection period is over
      if (newCell.infectionTime >= params.infectionDuration) {
        // Determine recovery vs death
        const random = Math.random();
        if (random < params.recoveryRate) {
          newCell.state = 'recovered';
          newCell.immunityTime = 0;
          newCell.infectionTime = 0;
        } else {
          newCell.state = 'dead';
        }
      }
      break;
      
    case 'recovered':
      // Progress immunity timer
      newCell.immunityTime++;
      
      // Lose immunity after duration
      if (newCell.immunityTime >= params.immunityDuration) {
        newCell.state = 'healthy';
        newCell.immunityTime = 0;
      }
      break;
      
    case 'dead':
      // Dead cells stay dead
      break;
      
    default:
      break;
  }
  
  return newCell;
};

// Update the entire grid for one simulation step
export const updateGrid = (grid, params) => {
  const newGrid = [];
  
  for (let y = 0; y < grid.length; y++) {
    newGrid[y] = [];
    for (let x = 0; x < grid[y].length; x++) {
      const infectedNeighbors = countInfectedNeighbors(grid, x, y);
      newGrid[y][x] = updateCell(grid[y][x], infectedNeighbors, params);
    }
  }
  
  return newGrid;
};

// Initialize grid with some random infections
export const initializeRandomInfections = (grid, numInfections = 10) => {
  const newGrid = JSON.parse(JSON.stringify(grid)); // Deep copy
  const rows = grid.length;
  const cols = grid[0].length;
  
  for (let i = 0; i < numInfections; i++) {
    const y = Math.floor(Math.random() * rows);
    const x = Math.floor(Math.random() * cols);
    
    if (newGrid[y][x].state === 'healthy') {
      newGrid[y][x] = {
        state: 'infected',
        infectionTime: 0,
        immunityTime: 0,
        variant: 'alpha'
      };
    }
  }
  
  return newGrid;
};

// Calculate R-value (reproduction number)
export const calculateRValue = (grid, params) => {
  let totalInfected = 0;
  let totalSusceptible = 0;
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if (cell.state === 'infected') {
        totalInfected++;
      } else if (cell.state === 'healthy') {
        totalSusceptible++;
      }
    }
  }
  
  if (totalInfected === 0) return 0;
  
  // Simple R-value calculation based on transmission rate and population density
  const avgContacts = 8; // Average number of neighbors
  const transmissionProbability = params.transmissionRate / avgContacts;
  
  return (transmissionProbability * totalSusceptible / (totalInfected + totalSusceptible)).toFixed(2);
}; 