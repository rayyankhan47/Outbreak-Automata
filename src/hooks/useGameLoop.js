import { useState, useRef, useCallback, useEffect } from 'react';

export const useGameLoop = () => {
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const updateFunctionRef = useRef(null);

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

  const gameLoop = useCallback((updateFunction) => {
    updateFunctionRef.current = updateFunction;
  }, []);

  // Main animation loop
  useEffect(() => {
    const animate = (currentTime) => {
      if (isRunning && updateFunctionRef.current) {
        // Cap at 60 FPS
        if (currentTime - lastTimeRef.current >= 16.67) { // ~60 FPS
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