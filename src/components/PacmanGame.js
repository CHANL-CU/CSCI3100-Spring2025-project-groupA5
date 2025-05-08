import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameUI from './GameUI.js';
const { GRID_SIDE, MAX_MEM, NODIR, UP, DOWN, LEFT, RIGHT, GAMEMAP_1, PICKUP_SCORE } = require('../constants.js');

// Usage: ./User.js
// Implement Pac-Man game logic, pass data to GameUI for display
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
  const map = useRef({width: 0, height: 0, grids: []});
  const score = useRef(0);
  const dots = useRef([]);
  const pacmanMoving = useRef(false);
  const [ghosts, setGhosts] = useState([]); // State to hold the ghosts

  const generateMap = () => {
    const { width, height, map } = GAMEMAP_1;
    const grids = Array.from({ length: height }, (_, y) => 
      Array.from({ length: width }, (_, x) => +map[x + y * width])
    );
    return { width, height, grids };
  };

  const generateDots = useCallback(() => {
    if (!map.current || map.current.length === 0) {
      console.error("Error: Map is undefined or empty!");
      return [];
    }
    const { width, height, grids } = map.current;
    const newDots = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grids[y][x] !== 1 && (x !== pacmanX || y !== pacmanY)) { 
          // Place dot on non-wall tiles
          newDots.push({ x, y });
        }
      }
    }
    return newDots;
  }, [map, pacmanX, pacmanY]);

  const getPacmanGrids = useCallback((x, y) => {
    if (x % GRID_SIDE !== 0) return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
                                    {x: Math.floor(x/GRID_SIDE)+1, y: Math.floor(y/GRID_SIDE)}];
    if (y % GRID_SIDE !== 0) return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
                                    {x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)+1}];
    return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}];
  }, []);

  const getGhostGrids = useCallback((x, y) => {
    return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}];
  }, []);

  const pacmanSteer = useCallback(() => {
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
      // Invalid if running into walls
      const next = getPacmanGrids(pacmanXRef.current+newDeltaX, pacmanYRef.current+newDeltaY);
      const grids = map.current.grids;
      if (grids[next[0].y][next[0].x] === 1 || grids[next[1].y][next[1].x] === 1) {
        console.log("STEER INTO WALLS!");
        return;
      }
    }
    pacmanMoving.current = true;
    deltaXRef.current = newDeltaX;
    deltaYRef.current = newDeltaY;
  }, [getPacmanGrids, pacmanXRef, pacmanYRef, inputDir, map, pacmanMoving, deltaXRef, deltaYRef]);

  const pacmanMove = useCallback(() => {
    if (!pacmanMoving.current) return;
    if (!map.current) return;
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
        // deltaXRef.current = 0;
        // deltaYRef.current = 0;
        console.log("MOVE INTO WALLS!");
        pacmanMoving.current = false;
      }
    }
    setPacmanX(newX);
    setPacmanY(newY);
    pacmanXRef.current = newX;
    pacmanYRef.current = newY;
  }, [pacmanMoving, map, deltaXRef, deltaYRef, pacmanXRef, pacmanYRef, getPacmanGrids, setPacmanX, setPacmanY]);

    // Ghost logic (3a, 3b, 3c, 3d)
    const moveGhosts = useCallback(() => {
        setGhosts(prevGhosts => {
            return prevGhosts.map(ghost => {
                const possibleDirections = [];
                const currentGrid = getGhostGrids(ghost.x, ghost.y)[0];

                // Check for available directions (no reversing)
                if (ghost.direction !== DOWN && map.current.grids[currentGrid.y - 1]?.[currentGrid.x] !== 1) {
                    possibleDirections.push(UP);
                }
                if (ghost.direction !== UP && map.current.grids[currentGrid.y + 1]?.[currentGrid.x] !== 1) {
                    possibleDirections.push(DOWN);
                }
                if (ghost.direction !== RIGHT && map.current.grids[currentGrid.y]?.[currentGrid.x - 1] !== 1) {
                    possibleDirections.push(LEFT);
                }
                if (ghost.direction !== LEFT && map.current.grids[currentGrid.y]?.[currentGrid.x + 1] !== 1) {
                    possibleDirections.push(RIGHT);
                }

                // Choose a random direction
                let newDirection = NODIR;
                if (possibleDirections.length > 0) {
                    newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                } else {
                    // No valid direction, reverse!
                    switch (ghost.direction) {
                        case UP: newDirection = DOWN; break;
                        case DOWN: newDirection = UP; break;
                        case LEFT: newDirection = RIGHT; break;
                        case RIGHT: newDirection = LEFT; break;
                        default: newDirection = NODIR; //Added default case
                    }
                }

                let newX = ghost.x;
                let newY = ghost.y;

                switch (newDirection) {
                    case UP: newY -= 1; break;
                    case DOWN: newY += 1; break;
                    case LEFT: newX -= 1; break;
                    case RIGHT: newX += 1; break;
                    default: break; // Added default case
                }

                //Wall collision is handled by possibleDirections check

                return {
                    ...ghost,
                    x: newX,
                    y: newY,
                    direction: newDirection,
                };
            });
        });
    }, [getGhostGrids, map]);

  const handle_movements = useCallback(() => {
    pacmanMove();
    if (inputMemory.current > 0) {
      pacmanSteer(); // change deltaX/Y if turning is valid
    }
    inputMemory.current -= 1;
    moveGhosts();
  }, [pacmanMove, inputMemory, pacmanSteer, moveGhosts]);

    // 3e: Collision detection
    const checkCollisions = useCallback(() => {
        ghosts.forEach(ghost => {
            const pacmanGrid = getPacmanGrids(pacmanXRef.current, pacmanYRef.current)[0];
            const ghostGrid = getGhostGrids(ghost.x, ghost.y)[0];

            if (pacmanGrid.x === ghostGrid.x && pacmanGrid.y === ghostGrid.y) {
                alert("Game Over!");
                // Reset the game (example)
                setPacmanX(GAMEMAP_1.initialPacmanX);
                setPacmanY(GAMEMAP_1.initialPacmanY);
                pacmanXRef.current = GAMEMAP_1.initialPacmanX;
                pacmanYRef.current = GAMEMAP_1.initialPacmanY;
                setGhosts(ghosts.map((ghost, index) => ({...ghost, x: 10 + index, y: 10, direction: NODIR})));
                score.current = 0;
                dots.current = generateDots();
            }
        });
    }, [ghosts, getPacmanGrids, getGhostGrids, setPacmanX, setPacmanY, setGhosts, generateDots]);

  const handle_collisions = useCallback(() => {
    // pick-up collisions
    for (let grid of getPacmanGrids(pacmanXRef.current, pacmanYRef.current)) {
      if (dots.current.some(dot => dot.x === grid.x && dot.y === grid.y)) { // Within grid with pick-up
        score.current += PICKUP_SCORE;
        dots.current = dots.current.filter(dot => dot.x !== grid.x || dot.y !== grid.y);
        console.log("PICKUP");
      }
    }
  }, [pacmanXRef, pacmanYRef, dots, getPacmanGrids]);

  useEffect(() => {
    // Init game map
    map.current = generateMap();
    dots.current = generateDots();
      // 3f: Initialize ghosts
      const initialGhosts = [
          { x: 10, y: 10, direction: NODIR },
          { x: 11, y: 10, direction: NODIR },
          { x: 10, y: 11, direction: NODIR },
          { x: 11, y: 11, direction: NODIR },
      ];
      setGhosts(initialGhosts);
    
    // Setup Game Logic to run per tick
    const interval = setInterval(() => {
      handle_movements();
	    handle_collisions();
        checkCollisions();
    }, 1000 / 60); // 60 ticks per second

    return () => clearInterval(interval);
  }, [checkCollisions, generateDots, handle_collisions, handle_movements]);

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

    // 3a: Render Ghosts
    const renderGhosts = () => {
        return ghosts.map((ghost, index) => (
            <div key={index} style={{
                position: 'absolute',
                left: ghost.x * GRID_SIDE,
                top: ghost.y * GRID_SIDE,
                width: GRID_SIDE,
                height: GRID_SIDE,
                backgroundColor: 'red',
                borderRadius: '100%',
            }}></div>
        ));
    };

  return (
    <div>
      <GameUI pacmanX={pacmanX} pacmanY={pacmanY}
      map={map.current.grids} dots={dots.current}
      dx={deltaXRef.current} dy={deltaYRef.current} pacmanMoving={pacmanMoving.current}
      score={score.current}/>
        {renderGhosts()}
    </div>
  );
};

export default PacmanGame;