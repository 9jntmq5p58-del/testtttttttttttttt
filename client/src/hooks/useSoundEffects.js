import { useEffect, useRef } from 'react';

const useSoundEffects = () => {
  const moveSound = useRef(null);
  const captureSound = useRef(null);
  const checkSound = useRef(null);
  const gameEndSound = useRef(null);

  useEffect(() => {
    // Preload all sound files
    moveSound.current = new Audio('/sounds/move.mp3');
    captureSound.current = new Audio('/sounds/capture.mp3');
    checkSound.current = new Audio('/sounds/check.mp3');
    gameEndSound.current = new Audio('/sounds/game-end.mp3');
  }, []);

  const playMove = () => {
    if (moveSound.current) {
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch((err) => {
        console.log('Sound play failed:', err);
      });
    }
  };

  const playCapture = () => {
    if (captureSound.current) {
      captureSound.current.currentTime = 0;
      captureSound.current.play().catch((err) => {
        console.log('Sound play failed:', err);
      });
    }
  };

  const playCheck = () => {
    if (checkSound.current) {
      checkSound.current.currentTime = 0;
      checkSound.current.play().catch((err) => {
        console.log('Sound play failed:', err);
      });
    }
  };

  const playGameEnd = () => {
    if (gameEndSound.current) {
      gameEndSound.current.currentTime = 0;
      gameEndSound.current.play().catch((err) => {
        console.log('Sound play failed:', err);
      });
    }
  };

  return {
    playMove,
    playCapture,
    playCheck,
    playGameEnd
  };
};

export default useSoundEffects;
