import { useState, useRef, useCallback, useEffect } from 'react';

export const useGameLoop = () => {
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const updateFunctionRef = useRef(null);
  const simulationSpeedRef = useRef(0.2); // Default to slower speed

  const startSimulation = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const gameLoop = useCallback((updateFunction, simulationSpeed = 0.2) => {
    updateFunctionRef.current = updateFunction;
    simulationSpeedRef.current = simulationSpeed;
    console.log('Game loop set up with speed:', simulationSpeed);
  }, []);

  // Function to update simulation speed dynamically
  const updateSimulationSpeed = useCallback((newSpeed) => {
    console.log('Updating simulation speed to:', newSpeed);
    simulationSpeedRef.current = newSpeed;
  }, []);

  // Main animation loop
  useEffect(() => {
    const animate = (currentTime) => {
      if (isRunning && updateFunctionRef.current) {
        // Calculate frame rate based on simulation speed
        // Base frame rate is now 12 FPS (slower), so 1x = 12 FPS
        const baseFrameRate = 12; // 12 FPS base (much slower)
        const targetFrameRate = baseFrameRate * simulationSpeedRef.current;
        const frameInterval = 1000 / targetFrameRate;
        
        if (currentTime - lastTimeRef.current >= frameInterval) {
          updateFunctionRef.current();
          lastTimeRef.current = currentTime;
        }
      }
      
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  return {
    isRunning,
    startSimulation,
    stopSimulation,
    gameLoop,
    updateSimulationSpeed
  };
}; 