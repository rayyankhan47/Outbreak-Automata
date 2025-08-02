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

// Check if cell is near a hospital (increases recovery rate)
export const isNearHospital = (grid, x, y) => {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const ny = y + dy;
      const nx = x + dx;
      
      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[ny].length) {
        if (grid[ny][nx]?.intervention === 'hospital') {
          return true;
        }
      }
    }
  }
  return false;
};

// Check if cell is in quarantine zone (reduces transmission)
export const isInQuarantine = (grid, x, y) => {
  return grid[y]?.[x]?.intervention === 'quarantine';
};

// Update a single cell based on simulation rules
export const updateCell = (cell, infectedNeighbors, params, grid, x, y) => {
  const newCell = { ...cell };
  
  switch (cell.state) {
    case 'healthy':
      // Become infected if enough infected neighbors
      let transmissionThreshold = params.transmissionRate;
      
      // Reduce transmission in quarantine zones
      if (isInQuarantine(grid, x, y)) {
        transmissionThreshold = Math.ceil(transmissionThreshold * 1.5);
      }
      
      if (infectedNeighbors >= transmissionThreshold) {
        newCell.state = 'infected';
        newCell.infectionTime = 0;
        newCell.variant = 'alpha';
      }
      break;
      
    case 'infected':
      // Progress infection timer
      newCell.infectionTime++;
      
      // Check if infection period is over
      if (newCell.infectionTime >= params.infectionDuration) {
        // Determine recovery vs death
        let recoveryChance = params.recoveryRate;
        
        // Increase recovery chance near hospitals
        if (isNearHospital(grid, x, y)) {
          recoveryChance = Math.min(0.95, recoveryChance + 0.2);
        }
        
        const random = Math.random();
        if (random < recoveryChance) {
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
      newGrid[y][x] = updateCell(grid[y][x], infectedNeighbors, params, grid, x, y);
    }
  }
  
  return newGrid;
};

// Apply intervention to the grid
export const applyIntervention = (grid, interventionType, x, y) => {
  const newGrid = JSON.parse(JSON.stringify(grid));
  
  switch (interventionType) {
    case 'vaccination':
      // Vaccinate a 3x3 area around the click point
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < newGrid[ny].length) {
            if (newGrid[ny][nx].state === 'healthy') {
              newGrid[ny][nx] = {
                ...newGrid[ny][nx],
                state: 'recovered',
                immunityTime: 0,
                intervention: 'vaccinated'
              };
            }
          }
        }
      }
      break;
      
    case 'quarantine':
      // Create a quarantine zone (5x5 area)
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < newGrid[ny].length) {
            newGrid[ny][nx] = {
              ...newGrid[ny][nx],
              intervention: 'quarantine'
            };
          }
        }
      }
      break;
      
    case 'hospital':
      // Place a hospital (single cell)
      if (y >= 0 && y < newGrid.length && x >= 0 && x < newGrid[y].length) {
        newGrid[y][x] = {
          ...newGrid[y][x],
          intervention: 'hospital'
        };
      }
      break;
      
    default:
      break;
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