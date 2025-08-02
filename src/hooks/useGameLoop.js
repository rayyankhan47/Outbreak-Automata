import { useState, useRef, useCallback, useEffect } from 'react';

export const useGameLoop = () => {
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const updateFunctionRef = useRef(null);
  const simulationSpeedRef = useRef(1.0);

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

  const gameLoop = useCallback((updateFunction, simulationSpeed = 1.0) => {
    updateFunctionRef.current = updateFunction;
    simulationSpeedRef.current = simulationSpeed;
  }, []);

  // Main animation loop
  useEffect(() => {
    const animate = (currentTime) => {
      if (isRunning && updateFunctionRef.current) {
        // Calculate frame rate based on simulation speed
        const baseFrameRate = 60; // 60 FPS base
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
    gameLoop
  };
}; 