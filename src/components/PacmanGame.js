import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';
const { GRID_SIDE, MAX_MEM, NODIR, UP, DOWN, LEFT, RIGHT, GAMEMAP_1 } = require('../constants.js');

const PacmanGame = () => {
  // ! Directly referencing states in useEffect always give their initial value
  // useRef for tracking values
  const [pacmanX, setPacmanX] = useState(GAMEMAP_1.initialPacmanX);
  const [pacmanY, setPacmanY] = useState(GAMEMAP_1.initialPacmanY);
  const pacmanXRef = useRef(pacmanX);
  const pacmanYRef = useRef(pacmanY);
  const deltaXRef = useRef(0);
  const deltaYRef = useRef(0);
  const inputMemory = useRef(0);
  const inputDir = useRef(NODIR);
  // const [map, setMap] = useState({width: 0, height: 0, grids: []});
  const map = useRef({width: 0, height: 0, grids: []});

  const generateMap = () => {
    const { width, height, map } = GAMEMAP_1;
    const grids = Array.from({ length: height }, (_, y) => 
      Array.from({ length: width }, (_, x) => +map[x + y * width])
    );
    return { width, height, grids };
  };

  const getPacmanGrids = (x, y) => {
    if (x % GRID_SIDE !== 0) return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
                                    {x: Math.floor(x/GRID_SIDE)+1, y: Math.floor(y/GRID_SIDE)}];
    if (y % GRID_SIDE !== 0) return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
                                    {x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)+1}];
    return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}];
  }

  const pacmanSteer = () => {
    const pacmanGrids = getPacmanGrids(pacmanXRef.current, pacmanYRef.current);
    let newDeltaX = 0;
    let newDeltaY = 0;
    switch (inputDir.current) {
      case UP:
        newDeltaY = -1;
        break;
      case DOWN:
        newDeltaY = 1;
        break;
      case LEFT:
        newDeltaX = -1;
        break;
      case RIGHT:
        newDeltaX = 1;
        break;
      default:
        return;
    }
    // Invalid if within 2 grids and turning 90 degrees
    if (pacmanGrids.length === 2) {
      if (pacmanGrids[0].y === pacmanGrids[1].y && newDeltaY !== 0) return;
      if (pacmanGrids[0].x === pacmanGrids[1].x && newDeltaX !== 0) return;
    } else {
      // TODO: Invalid if running into walls
      const next = getPacmanGrids(pacmanXRef.current+newDeltaX, pacmanYRef.current+newDeltaY);
      const grids = map.current.grids;
      if (grids[next[0].y][next[0].x] === 1 || grids[next[1].y][next[1].x] === 1) {
        console.log("STEER INTO WALLS!");
        return;
      }
    }
    deltaXRef.current = newDeltaX;
    deltaYRef.current = newDeltaY;
  }

  const pacmanMove = () => {
    if (map.current == []) return;
    if (deltaXRef.current === 0 && deltaYRef.current === 0) return;
    const grids = map.current.grids;
    const width = map.current.width;
    const height = map.current.height;
    let newX = pacmanXRef.current + deltaXRef.current;
    let newY = pacmanYRef.current + deltaYRef.current;
    // Teleport when reaching boundaries
    if (newX < 0) newX = (width - 1) * GRID_SIDE;
    if (newX > (width-1) * GRID_SIDE) newX = 0;
    if (newY < 0) newY = (height - 1) * GRID_SIDE;
    if (newY >= (height-1) * GRID_SIDE) newY = 0;
    // Reset deltas if next move would run into walls
    if (getPacmanGrids(newX, newY).length === 1) {
      const next = getPacmanGrids(newX+deltaXRef.current, newY+deltaYRef.current);
      if (grids[next[0].y][next[0].x] === 1 || grids[next[1].y][next[1].x] === 1) {
        deltaXRef.current = 0;
        deltaYRef.current = 0;
        console.log("MOVE INTO WALLS!");
      }
    }
    setPacmanX(newX);
    setPacmanY(newY);
    pacmanXRef.current = newX;
    pacmanYRef.current = newY;
  }

  const handle_movements = () => {
    pacmanMove();
    if (inputMemory.current > 0) {
      pacmanSteer(); // change deltaX/Y if turning is valid
    }
    inputMemory.current -= 1;

    /* TODO: Ghosts
    for (g of ghosts) {
      g.routeAI(pman.pos, map); 
      g.move();
    }
    */
  }

  const handle_collisions = () => {
    // TODO
  }

  // Setup Game Logic to run per tick
  useEffect(() => {
    // Init game map
    map.current = generateMap();
    
    const interval = setInterval(() => {
      handle_movements()
	    handle_collisions()
    }, 1000 / 60); // 60 ticks per second

    return () => clearInterval(interval);
  }, []);

  // Add Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case 'ArrowRight':
          inputDir.current = RIGHT;
          break;
        case 'ArrowLeft':
          inputDir.current = LEFT;
          break;
        case 'ArrowUp':
          inputDir.current = UP;
          break;
        case 'ArrowDown':
          inputDir.current = DOWN;
          break;
        default:
          return;
      }
      inputMemory.current = MAX_MEM;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      <GameUI pacmanX={pacmanX} pacmanY={pacmanY} map={map.current.grids} />
    </div>
  );
};

export default PacmanGame;