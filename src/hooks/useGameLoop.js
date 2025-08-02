import { useState, useRef, useCallback } from 'react';

export const useGameLoop = () => {
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const gameLoop = useCallback((currentTime, updateFunction) => {
    if (!isRunning) return;

    // Cap at 60 FPS
    if (currentTime - lastTimeRef.current >= 16.67) { // ~60 FPS
      updateFunction();
      lastTimeRef.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame((time) => 
      gameLoop(time, updateFunction)
    );
  }, [isRunning]);

  return {
    isRunning,
    startSimulation,
    stopSimulation,
    gameLoop
  };
}; 