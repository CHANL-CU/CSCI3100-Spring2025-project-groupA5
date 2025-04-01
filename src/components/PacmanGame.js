import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';

// Usage: ./User.js
// Implement Pac-Man game logic, pass data to GameUI for display
const PacmanGame = () => {
  const [pacmanX, setPacmanX] = useState(1);
  const [pacmanY, setPacmanY] = useState(1);
  const [delta, setDelta] = useState(1); 
  const pacmanXRef = useRef(pacmanX);
  const deltaRef = useRef(delta);

  // ! Directly referencing states in useEffect always give their initial value
  // useRef for tracking values
  useEffect(() => {
    const interval = setInterval(() => {
      // Update pacmanX and pacmanY by delta every tick (example only)
      setPacmanX(currX => {
        const newX = currX + deltaRef.current;
        pacmanXRef.current = newX; // Update ref to the new value
        return newX;
      });
      setPacmanY(currY => currY + deltaRef.current);
      // Update delta based on the current value of pacmanX
      setDelta(currDel => {
        const newDel = (pacmanXRef.current > 100) ? -1 : (pacmanXRef.current <= 0 ? 1 : currDel);
        deltaRef.current = newDel;
        return newDel;
      });
    }, 1000 / 30); // 30 ticks per second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div>
      <h2>Pac-Man Game</h2>
      <p>This is where the Pac-Man game will be implemented.</p>
      <GameUI pacmanX={pacmanX} pacmanY={pacmanY} />
    </div>
  );
};

export default PacmanGame;