import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';
import useSound from 'use-sound';
import pickupSfx from '../sfx/pickup.mp3';
const { GRID_SIDE, MAX_MEM, NODIR, UP, DOWN, LEFT, RIGHT, GRID_PATH, GRID_WALL, GRID_GATE, GRID_GSPAWN, GAMEMAP_1, PICKUP_SCORE } = require('../constants.js');

class Ghost {
    constructor(x, y, chooseDir) {
        this.x = x;
        this.y = y;
        this.chooseDir = chooseDir; // (grids, pacmanPosition) => DIR
    }
}

// Usage: ./User.js
// Implement Pac-Man game logic, pass data to GameUI for display
const PacmanGame = ({ colorTheme, sendScore }) => {
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
  const mapRef = useRef({width: 0, height: 0, grids: []});
  const score = useRef(0);
  const dots = useRef([]);
  const powerupSpawns = useRef(GAMEMAP_1.powerupSpawns);
  const powerups = useRef([]);
  const ghostSpawns = useRef([]);
  const ghosts = useRef([]);
  const pacmanMoving = useRef(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef(null); // Store game loop interval

  const [playPickupSfx, { sound: pickupSound }] = useSound(pickupSfx, { volume: 0.75 });

  // dummy timer variable, delete if end game condition is completed
  const [timer, setTimer] = useState(10);

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

  // Game Initialization
  useEffect(() => {
    resetStates();
    const gameLoop = initGame();

    const timerInterval = setInterval(() => {
      console.log("TIMER TICKING");
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          setGameOver(true);
          clearInterval(timerInterval);
          clearInterval(gameLoopRef.current); // Stop game loop when game ends
          sendScore(score.current);
          return 0;
        }
      });
    }, 1000);

    return () => {
      resetStates();
      clearInterval(gameLoop);
      clearInterval(timerInterval);
    }
  }, [pickupSound]);

  const resetStates = () => {
    setPacmanX(0);
    setPacmanY(0);
    pacmanXRef.current = 0;
    pacmanYRef.current = 0;
    deltaXRef.current = 0;
    deltaYRef.current = 0;
    inputMemory.current = 0;
    inputDir.current = NODIR;
    mapRef.current = {width: 0, height: 0, grids: []};
    score.current = 0;
    dots.current = [];
    powerupSpawns.current = [];
    powerups.current = [];
    ghostSpawns.current = [];
    ghosts.current = [];
    pacmanMoving.current = false;
    setGameOver(false);
    gameLoopRef.current = null;
    setTimer(0);
  }

  const initGame = () => {
    // Init game map
    // TODO: Select from multiple maps
    const chosenMap = GAMEMAP_1;
    const { height, width, initialPacmanX, initialPacmanY, powerupSpawns, map } = chosenMap;
    const grids = Array.from({ length: height }, (_, y) => 
      Array.from({ length: width }, (_, x) => +map[x + y * width])
    );
    mapRef.current = { width, height, grids };
    // Init Pac-Man Position
    setPacmanX(initialPacmanX);
    setPacmanY(initialPacmanY);
    pacmanXRef.current = initialPacmanX;
    pacmanYRef.current = initialPacmanY;
    // Create power-ups, pick-ups, ghost spawn zones
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (powerupSpawns.some(p => p[0] === x && p[1] === y)) { 
          powerups.current.push({ x, y });
        } else if (grids[y][x] === GRID_PATH && (x*GRID_SIDE !== pacmanXRef.current || y*GRID_SIDE !== pacmanYRef.current)) { 
          // Place dot on non-wall tiles
          dots.current.push({ x, y });
        } else if (grids[y][x] === GRID_GSPAWN) {
          ghostSpawns.current.push({ x, y });
        }
      }
    }
    // Create ghosts
    let i = 0;
    for (let x = 0; x < 4; x++) { // TODO: not use arbitrary number 4
      ghosts.current.push(new Ghost(ghostSpawns.current[i].x*GRID_SIDE, ghostSpawns.current[i].y*GRID_SIDE, undefined));
      i = (i + 1) % ghostSpawns.current.length;
    }
    // Setup Game Logic to run per tick
    const gameLoop = setInterval(() => {
      handle_movements();
	    handle_collisions();
    }, 1000 / 60); // 60 ticks per second
    gameLoopRef.current = gameLoop;
    setGameOver(false);
    setTimer(10);
    return gameLoop;
  }

  const getPacmanGrids = (x, y) => {
    if (x % GRID_SIDE !== 0) return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
                                    {x: Math.floor(x/GRID_SIDE)+1, y: Math.floor(y/GRID_SIDE)}];
    if (y % GRID_SIDE !== 0) return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
                                    {x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)+1}];
    return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}];
  };

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
      // Invalid if running into walls
      const next = getPacmanGrids(pacmanXRef.current+newDeltaX, pacmanYRef.current+newDeltaY);
      const grids = mapRef.current.grids;
      if (grids[next[0].y]?.[next[0].x] !== GRID_PATH || grids[next[1].y]?.[next[1].x] !== GRID_PATH) {
        console.log("STEER INTO WALLS!");
        return;
      }
    }
    pacmanMoving.current = true;
    deltaXRef.current = newDeltaX;
    deltaYRef.current = newDeltaY;
  };

  const pacmanMove = () => {
    if (!pacmanMoving.current || !mapRef.current || (deltaXRef.current === 0 && deltaYRef.current === 0)) return;
    const { grids, width, height } = mapRef.current;
    let newX = pacmanXRef.current + deltaXRef.current;
    let newY = pacmanYRef.current + deltaYRef.current;
    // Teleport when reaching boundaries
    if (newX <= 0) newX = (width - 1) * GRID_SIDE;
    else if (newX >= (width-1) * GRID_SIDE) newX = 0;
    if (newY <= 0) newY = (height - 1) * GRID_SIDE;
    else if (newY >= (height-1) * GRID_SIDE) newY = 0;
    // Reset deltas if next move would run into walls
    if (getPacmanGrids(newX, newY).length === 1) {
      const next = getPacmanGrids(newX+deltaXRef.current, newY+deltaYRef.current);
      if (grids[next[0].y][next[0].x] !== GRID_PATH || grids[next[1].y][next[1].x] !== GRID_PATH) {
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
  };

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
  };

  const handle_collisions = () => {
    // if (gameOver) return; // Stop collision checks when game ends but gameOver value is not correct due to closure maybe
    // pick-up collisions
    for (let grid of getPacmanGrids(pacmanXRef.current, pacmanYRef.current)) {
      // Pick-up
      if (dots.current.some(dot => dot.x === grid.x && dot.y === grid.y)) {
        score.current += PICKUP_SCORE;
        dots.current = dots.current.filter(dot => dot.x !== grid.x || dot.y !== grid.y);
        playPickupSfx();
        console.log("PICKUP");
      }
      // Power-up
      if (powerups.current.some(dot => dot.x === grid.x && dot.y === grid.y)) {
        // TODO: Trigger all Ghosts' fearing
        powerups.current = powerups.current.filter(dot => dot.x !== grid.x || dot.y !== grid.y);
        playPickupSfx();
        console.log("POWERUP");
      }
    }

    // TODO: Ghosts collision
  };

  // Reset game when retry button is clicked
  const handleRetry = () => {
    resetStates();
    const gameLoop = initGame();

    const timerInterval = setInterval(() => {
      console.log("TIMER TICKING");
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          setGameOver(true);
          clearInterval(timerInterval);
          clearInterval(gameLoop); // Stop game loop when game ends
          return 0;
        }
      });
    }, 1000);
  };

  return (
    <>
    {!gameOver ? (
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2>Time Left: {timer}s</h2> {/* Timer Display */}
        <GameUI
          pacmanX={pacmanX}
          pacmanY={pacmanY}
          map={mapRef.current.grids}
          dots={dots.current}
          powerups={powerups.current}
          dx={deltaXRef.current}
          dy={deltaYRef.current}
          pacmanMoving={pacmanMoving.current}
          ghosts={ghosts.current}
          score={score.current}
          colorTheme={colorTheme}
        />
      </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h1>Game Over!</h1>
          <p>Score: {score.current}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}
    </>
  );
};

export default PacmanGame;