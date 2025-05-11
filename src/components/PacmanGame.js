import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';
import useSound from 'use-sound';
import pickupSfx from '../sfx/pickup.mp3';
const { GRID_SIDE, MAX_MEM, NODIR, UP, DOWN, LEFT, RIGHT, GRID_PATH, GRID_WALL, GRID_GATE, GRID_GSPAWN, GAMEMAP_1, PICKUP_SCORE, GHOST_SCORE } = require('../constants.js');

class Ghost {
  constructor(x, y, chooseDir) {
    this.x = x;
    this.y = y;
    this.chooseDir = chooseDir; // Strategy pattern for different ghost behaviors
    this.direction = NODIR;
    this.inSpawn = true;
    this.fear = 0;
  }

  routeAI(pacman, grids) {
    const currentGrid = this.getGridPos();
    const pacmanGrid = {
      x: Math.floor(pacman.x / GRID_SIDE),
      y: Math.floor(pacman.y / GRID_SIDE)
    };

    if (this.inSpawn) {
      // Leaving spawn behavior
      if (grids[currentGrid.y][currentGrid.x] === GRID_GATE) {
        // At gate - find path to nearest normal path
        const pathTarget = this.findNearestPathGrid(grids);
        if (pathTarget) {
          this.direction = this.findPathToTarget(grids, pathTarget);
        }
        this.inSpawn = false;
      } else {
        // Not at gate yet - move toward nearest gate
        const gateTarget = this.findNearestGate(grids);
        if (gateTarget) {
          this.direction = this.findPathToTarget(grids, gateTarget);
        }
      }
    } else if (this.fear > 0) {
      // Fleeing behavior - move away from Pac-Man
      this.direction = this.findPathToTarget(grids, pacmanGrid, true);
    } else {
      // Normal chasing behavior - use the strategy pattern
      this.direction = this.chooseDir(pacmanGrid, grids, this);
    }
  }

  // Helper method to get current grid position
  getGridPos() {
    return {
      x: Math.floor(this.x / GRID_SIDE),
      y: Math.floor(this.y / GRID_SIDE)
    };
  }

  // Helper method to get possible directions excluding walls and opposite direction
  getPossibleDirections(grids) {
    const currentGrid = this.getGridPos();
    const directions = [];
    const height = grids.length
    const width = grids[0].length;
    
    // Check each direction (excluding opposite of current direction)
    if (this.direction !== DOWN) {
      if (currentGrid.y - 1 >= 0 && grids[currentGrid.y - 1]?.[currentGrid.x] !== GRID_WALL && !(!this.inSpawn && grids[currentGrid.y - 1]?.[currentGrid.x] === GRID_GATE)) {
        directions.push(UP);
      }
    }
    if (this.direction !== UP) {
      if (currentGrid.y + 1 < height && grids[currentGrid.y + 1]?.[currentGrid.x] !== GRID_WALL && !(!this.inSpawn && grids[currentGrid.y + 1]?.[currentGrid.x] === GRID_GATE)) {
        directions.push(DOWN);
      }
    }
    if (this.direction !== RIGHT) {
      if (currentGrid.x - 1 >= 0 && grids[currentGrid.y]?.[currentGrid.x - 1] !== GRID_WALL && !(!this.inSpawn && grids[currentGrid.y]?.[currentGrid.x - 1] === GRID_GATE)) {
        directions.push(LEFT);
      }
    }
    if (this.direction !== LEFT) {
      if (currentGrid.x + 1 < width && grids[currentGrid.y]?.[currentGrid.x + 1] !== GRID_WALL && !(!this.inSpawn && grids[currentGrid.y]?.[currentGrid.x + 1] === GRID_GATE)) {
        directions.push(RIGHT);
      }
    }
    
    // If no directions available (dead end), allow opposite direction
    if (directions.length === 0 && this.direction !== NODIR) {
      switch (this.direction) {
        case UP: directions.push(DOWN); break;
        case DOWN: directions.push(UP); break;
        case LEFT: directions.push(RIGHT); break;
        case RIGHT: directions.push(LEFT); break;
      }
    }
    
    return directions;
  }

  // Find direction to target position using simple "Manhattan distance" heuristic
  findPathToTarget(grids, target, avoidTarget = false) {
    const possibleDirs = this.getPossibleDirections(grids);
    if (possibleDirs.length === 0) return NODIR;
    
    const currentGrid = this.getGridPos();
    let bestDir = possibleDirs[0];
    let bestScore = avoidTarget ? -Infinity : Infinity;
    
    for (const dir of possibleDirs) {
      let nextGrid = {...currentGrid};
      switch (dir) {
        case UP: nextGrid.y--; break;
        case DOWN: nextGrid.y++; break;
        case LEFT: nextGrid.x--; break;
        case RIGHT: nextGrid.x++; break;
      }
      
      // Calculate Manhattan distance to target
      const distance = Math.abs(nextGrid.x - target.x) + Math.abs(nextGrid.y - target.y);
      const score = avoidTarget ? distance : -distance;
      
      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }
    
    return bestDir;
  }

  // Helper to find nearest path grid when leaving spawn
  findNearestPathGrid(grids) {
    const currentGrid = this.getGridPos();
    const visited = new Set();
    const queue = [{...currentGrid, dist: 0}];
    
    while (queue.length > 0) {
      const {x, y, dist} = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (grids[y][x] === GRID_PATH) {
        return {x, y};
      }
      
      // Check adjacent grids
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (grids[ny]?.[nx] !== undefined && grids[ny][nx] !== GRID_WALL) {
          queue.push({x: nx, y: ny, dist: dist + 1});
        }
      }
    }
    
    return null;
  }

  // Helper to find nearest gate when in spawn
  findNearestGate(grids) {
    const currentGrid = this.getGridPos();
    const visited = new Set();
    const queue = [{...currentGrid, dist: 0}];
    
    while (queue.length > 0) {
      const {x, y, dist} = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (grids[y][x] === GRID_GATE) {
        return {x, y};
      }
      
      // Check adjacent grids
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (grids[ny]?.[nx] !== undefined && grids[ny][nx] !== GRID_WALL) {
          queue.push({x: nx, y: ny, dist: dist + 1});
        }
      }
    }
    
    return null;
  }

  move() {
    switch (this.direction) {
      case UP:
        this.y -= 1;
        break;
      case DOWN:
        this.y += 1;
        break;
      case LEFT:
        this.x -= 1;
        break;
      case RIGHT:
        this.x += 1;
        break;
      default:
        break;
    }
  }
}

// Usage: ./User.js
// Implement Pac-Man game logic, pass data to GameUI for display
const PacmanGame = ({ colorTheme, sendScore }) => {
  // ! Directly referencing states in useEffect always give their initial value
  // useRef for tracking values
  const [gameTick, setGameTick] = useState(0);
  const pacmanXRef = useRef(0);
  const pacmanYRef = useRef(0);
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
    return () => {
      resetStates();
      clearInterval(gameLoop);
    }
  }, [pickupSound]);

  const resetStates = () => {
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
      ghosts.current.push(new Ghost(
        ghostSpawns.current[i].x*GRID_SIDE, 
        ghostSpawns.current[i].y*GRID_SIDE, 
        ghostAIRandom
      ));
      i = (i + 1) % ghostSpawns.current.length;
    }
    // Setup Game Logic to run per tick
    const gameLoop = setInterval(() => {
      handle_movements();
	    handle_collisions();
      setGameTick((prevTick) => { return prevTick >= 60 ? 0 : prevTick + 1 });
    }, 1000 / 60); // 60 ticks per second
    gameLoopRef.current = gameLoop;
    setGameOver(false);
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
    pacmanXRef.current = newX;
    pacmanYRef.current = newY;
  };

  const handle_movements = () => {
    pacmanMove();
    if (inputMemory.current > 0) {
      pacmanSteer(); // change deltaX/Y if turning is valid
    }
    inputMemory.current -= 1;
    for (let g of ghosts.current) {
      if (g.x % GRID_SIDE === 0 && g.y % GRID_SIDE === 0) {
        g.routeAI({ x: pacmanXRef.current, y: pacmanYRef.current }, mapRef.current.grids); 
      }
      g.move();
      g.fear = Math.max(0, g.fear-1);
    }
  };

  const handle_collisions = () => {
    // Collision detection constants
    const PICKUP_RADIUS = GRID_SIDE * 0.4; // 40% of grid size
    const GHOST_COLLISION_RADIUS = GRID_SIDE * 0.3; // 30% of grid size
    const pacmanCenter = {
      x: pacmanXRef.current + GRID_SIDE / 2,
      y: pacmanYRef.current + GRID_SIDE / 2
    };

    // Pick-up collisions (dots and powerups)
    const checkPickupCollision = (pickup) => {
      const pickupCenter = {
        x: pickup.x * GRID_SIDE + GRID_SIDE / 2,
        y: pickup.y * GRID_SIDE + GRID_SIDE / 2
      };
      const dx = Math.abs(pacmanCenter.x - pickupCenter.x);
      const dy = Math.abs(pacmanCenter.y - pickupCenter.y);
      return dx < PICKUP_RADIUS && dy < PICKUP_RADIUS;
    };
    // Check dot collisions
    dots.current = dots.current.filter(dot => {
      if (checkPickupCollision(dot)) {
        score.current += PICKUP_SCORE;
        playPickupSfx();
        console.log("PICKUP");
        return false; // Remove this dot
      }
      return true; // Keep this dot
    });
    // Check powerup collisions
    powerups.current = powerups.current.filter(powerup => {
      if (checkPickupCollision(powerup)) {
        // Trigger fear in all ghosts
        ghosts.current.forEach(ghost => {
          ghost.fear = 600; // 600 ticks -> 10 seconds
        });
        playPickupSfx();
        console.log("POWERUP");
        return false; // Remove this powerup
      }
      return true; // Keep this powerup
    });
    // Ghost collisions
    ghosts.current.forEach(ghost => {
      const ghostCenter = {
        x: ghost.x + GRID_SIDE / 2,
        y: ghost.y + GRID_SIDE / 2
      };
      const dx = Math.abs(pacmanCenter.x - ghostCenter.x);
      const dy = Math.abs(pacmanCenter.y - ghostCenter.y);

      if (dx < GHOST_COLLISION_RADIUS && dy < GHOST_COLLISION_RADIUS) {
        if (ghost.fear > 0) {
          // Pac-Man eat ghost
          const respawnGrid = ghostSpawns.current[Math.floor(Math.random() * ghostSpawns.current.length)];
          score.current += GHOST_SCORE;
          ghost.x = respawnGrid.x*GRID_SIDE;
          ghost.y = respawnGrid.y*GRID_SIDE;
          ghost.inSpawn = true;
          ghost.fear = 0;
          ghost.direction = NODIR;
          // playGhostEatenSfx();
          console.log("GHOST EATEN");
        } else {
          console.log("GAME OVER");
          // playDeathSfx();
          endGame();
        }
      }
    });
  };

  const endGame = () => {
    setGameOver(true);
    clearInterval(gameLoopRef.current); // Stop game loop when game ends
    sendScore(score.current);
  }

  // Reset game when retry button is clicked
  const handleRetry = () => {
    resetStates();
    const gameLoop = initGame();
  };

  const ghostAIRandom = (pacman, grids, ghostInstance) => {
    const dirs = ghostInstance.getPossibleDirections(grids);
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  return (
    <>
    {!gameOver ? (
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <GameUI
          pacmanX={pacmanXRef.current}
          pacmanY={pacmanYRef.current}
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