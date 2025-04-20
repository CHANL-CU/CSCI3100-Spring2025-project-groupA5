import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';


// Usage: ./User.js
// Implement Pac-Man game logic, pass data to GameUI for display
const PacmanGame = () => {
  const [pacmanX, setPacmanX] = useState(1);
  const [pacmanY, setPacmanY] = useState(1);
  const [delta, setDelta] = useState(1);
  const pacmanXRef = useRef(pacmanX);
  const pacmanYRef = useRef(pacmanY);
  const deltaRef = useRef(delta);
  const [map, setMap] = useState([]);


  //generate a map frame
  const generateMap = () => {
    const width = 30;
    const height = 30;
    const grids = Array(height).fill().map(() => Array(width).fill(0)); // Start with all paths

    // Add walls two holes
    for (let y = 0; y < height; y++) {
        grids[y][0] = 1;
        grids[y][width - 1] = 1;
    }
    for (let x = 0; x < width; x++) {
        grids[0][x] = 1;
        grids[height - 1][x] = 1;
    }
    grids[height / 2][0] = 0;
    grids[height / 2][width - 1] = 0;

    // Add 6 random obstacles which are 1x4 straight walls, horizontal walls and 2x2 blocks
    const obstaclesCount = 20;
    for (let i = 0; i < obstaclesCount; i++) {
      let obstaclesPlaceX = Math.floor(Math.random() * 22) + 2; // place of obstacles from 2 to 28
      let obstaclesPlaceY = Math.floor(Math.random() * 22) + 2;
      let obstaclesType = Math.floor(Math.random() * 3); // type of obstacles
      switch(obstaclesType) {
        case 0:
          for (let y = obstaclesPlaceY; y < obstaclesPlaceY + 4; y++) {
            grids[y][obstaclesPlaceX] = 1;
          }
          break;
        case 1:
          for (let x = obstaclesPlaceX; x < obstaclesPlaceX + 4; x++) {
            grids[obstaclesPlaceY][x] = 1;
          }
          break;
        case 2:
          grids[obstaclesPlaceY][obstaclesPlaceX] = 1;
          grids[obstaclesPlaceY + 1][obstaclesPlaceX] = 1;
          grids[obstaclesPlaceY][obstaclesPlaceX + 1] = 1;
          grids[obstaclesPlaceY + 1][obstaclesPlaceX + 1] = 1;
          break
        default:
      }
    }

    return {grids};
  };
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


  //Add Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setDelta(1);
      if (e.key === 'ArrowLeft' ) setDelta(-1);
    };
 
    // Stop moving when KeyUp
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setDelta(0);
      }
    };
 
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
 
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);


  //initialize the game with map
  useEffect(() => {
      const initGame = () => {
        const Map = generateMap();
        setMap(Map.grids);
      };
      initGame();
    }, []);


  return (
    <div>
      <h2>Pac-Man Game</h2>
      <p>This is where the Pac-Man game will be implemented.</p>
      <GameUI
      pacmanX={pacmanX}
      pacmanY={pacmanY}
      map={map}/>
    </div>
  );
};


export default PacmanGame;
