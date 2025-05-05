 import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';
const { GAMEMAP_1 } = require('../constants.js');

// Usage: ./User.js
// Implement Pac-Man game logic, pass data to GameUI for display
const PacmanGame = () => {
  const [pacmanX, setPacmanX] = useState(GAMEMAP_1.initialPacmanX);
  const [pacmanY, setPacmanY] = useState(GAMEMAP_1.initialPacmanY);
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const pacmanXRef = useRef(pacmanX);
  const pacmanYRef = useRef(pacmanY);
  const deltaRefX = useRef(deltaX);
  const deltaRefY = useRef(deltaY);
  const [lastDirection, setLastDirection] = useState(0); // Default facing right (0 degrees)
  const [map, setMap] = useState([]);
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState([]);


  //generate a map frame
  const generateMap = () => {
    const width = GAMEMAP_1.width;
    const height = GAMEMAP_1.height;
    const map = GAMEMAP_1.map;
    const grids = Array(height).fill().map(() => Array(width).fill(0));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grids[y][x] = +map[x+y*width];  
      }
    }
    return {grids};
  };

  // Generate yellow dots on the map(excluding Pac-Man’s spawn point)
  const generateDots = () => {
    if (!map || map.length === 0) {
      console.error("Error: Map is undefined or empty!");
      return [];
    }
  
    const width = GAMEMAP_1.width;
    const height = GAMEMAP_1.height;
    const newDots = [];
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (map[y][x] !== 1 && (x !== pacmanX || y !== pacmanY)) { 
          // Only place dots on non-wall tiles
          newDots.push({ x, y });
        }
      }
    }
    return newDots;
  };

  useEffect(() => {
    const generatedMap = generateMap();
    setMap(generatedMap.grids);
  }, []);
  
  useEffect(() => {
    if (map.length > 0) { // Ensure `map` is set before generating dots
      setDots(generateDots());
    }
  }, [map]); // Runs again whenever `map` updates


  // ! Directly referencing states in useEffect always give their initial value
  // useRef for tracking values
  useEffect(() => {
    // Get map once for reference to movement
    const Map = generateMap();
    const width = GAMEMAP_1.width;
    const height = GAMEMAP_1.height;

    const interval = setInterval(() => {

      if (Map.grids[pacmanYRef.current + deltaRefY.current][pacmanXRef.current + deltaRefX.current] === 1){
        // Stop movement if hitting a wall
        deltaRefX.current = 0;
        deltaRefY.current = 0;
        setDeltaX(0);
        setDeltaY(0);
      }
      else {
      // Update pacmanX and pacmanY by delta every tick (example only)
      setPacmanX(currX => {
        let newX = currX + deltaRefX.current;
        // tp
        if (newX < 0) newX = width - 1;
        if (newX >= width) newX = 0;
        pacmanXRef.current = newX; // Update ref
        return newX;
      });
      setPacmanY(currY => {
        let newY = currY + deltaRefY.current;
        // tp
        if (newY < 0) newY = height - 1;
        if (newY >= height) newY = 0;
        pacmanYRef.current = newY; // Update ref
        return newY;
      });

      // Remove dots if Pac-Man moves onto them
      setDots(prevDots => {
        const newDots = prevDots.filter(dot => !(dot.x === pacmanXRef.current && dot.y === pacmanYRef.current));
        if (newDots.length !== prevDots.length) {
          setScore(prevScore => prevScore + 20); // Increase score only when a dot was collected
        }
        return newDots;
      });
      }
    }, 1000 / 5); // 30 ticks per second >> slowed to 5 ticks for easier to ply by Jamie
    
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);



  //Add Keyboard Input
  useEffect(() => {

    // Get map once for reference to movement
    const Map = generateMap();

    const handleKeyDown = (e) => {

      // Prevent scrolling the browser
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      let preDeltaX = deltaRefX.current;
      let preDeltaY = deltaRefY.current;
      let newDirection = lastDirection; 
      // Left-Right 
      if (e.key === 'ArrowRight') {
        preDeltaX = 1;
        preDeltaY = 0;
        newDirection = 0; // Face right

      }
      else if (e.key === 'ArrowLeft') {
        preDeltaX = -1;
        preDeltaY = 0;
        newDirection = 180; // Face left

      }
      // Up-Down
      else if (e.key === 'ArrowUp') {
        preDeltaX = 0;
        preDeltaY = -1;
        newDirection = 270; // Face up

      }
      else if (e.key === 'ArrowDown') {
        preDeltaX = 0;
        preDeltaY = 1;
        newDirection = 90; // Face down

      }

      //update delta
      if(Map.grids[pacmanYRef.current + preDeltaY][pacmanXRef.current + preDeltaX] !== 1) {
        deltaRefX.current = preDeltaX;
        deltaRefY.current = preDeltaY;
        setDeltaX(preDeltaX);
        setDeltaY(preDeltaY);
        setLastDirection(newDirection); // Store new direction

      }  
    };
 
    window.addEventListener('keydown', handleKeyDown);
 
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
      <p>This is where the Pac-Man game will be implemented.score=[{score}]</p>
      <GameUI
        pacmanX={pacmanX}
        pacmanY={pacmanY}
        map={map}
        dots={dots}
        score={score}
        lastDirection={lastDirection}
      />
    </div>
  );
};


export default PacmanGame;
