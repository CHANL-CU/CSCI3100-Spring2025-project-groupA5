import React, { useState, useEffect, useRef } from 'react';
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
    const [ghosts, setGhosts] = useState([]);

    const width = GAMEMAP_1.width; // Use width from GAMEMAP_1
    const [squares, setSquares] = useState([]); // Initialize squares state

  const generateMap = () => {
    const { width, height, map } = GAMEMAP_1;
    const grids = Array.from({ length: height }, (_, y) => 
      Array.from({ length: width }, (_, x) => +map[x + y * width])
    );
    return { width, height, grids };
  };

    const generateSquares = useCallback(() => {
        const { width, height, map } = GAMEMAP_1;
        const newSquares = [];
        for (let i = 0; i < width * height; i++) {
            if (map[i] === 1) {
                newSquares.push('wall');
            } else if (map[i] === 0) {
                newSquares.push('pac-dot');
            } else {
                newSquares.push('blank');
            }
        }
        setSquares(newSquares);
    }, []);

  const generateDots = () => {
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
  };

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
      const grids = map.current.grids;
      if (grids[next[0].y][next[0].x] === 1 || grids[next[1].y][next[1].x] === 1) {
        console.log("STEER INTO WALLS!");
        return;
      }
    }
    pacmanMoving.current = true;
    deltaXRef.current = newDeltaX;
    deltaYRef.current = newDeltaY;
  };

    const [pacmanCurrentIndex, setPacmanCurrentIndex] = useState(GAMEMAP_1.initialPacmanX + GAMEMAP_1.initialPacmanY * width);

    const movePacman = useCallback((e) => {
        setSquares(prevSquares => {
            const newSquares = [...prevSquares];
            newSquares[pacmanCurrentIndex] = newSquares[pacmanCurrentIndex].replace('pac-man', '').trim();

            switch (e.keyCode) {
                case 37: // Left
                    if (pacmanCurrentIndex % width !== 0 && !newSquares[pacmanCurrentIndex - 1].includes('wall')) {
                        setPacmanCurrentIndex(pacmanCurrentIndex - 1);
                    }
                    break;
                case 38: // Up
                    if (pacmanCurrentIndex - width >= 0 && !newSquares[pacmanCurrentIndex - width].includes('wall')) {
                        setPacmanCurrentIndex(pacmanCurrentIndex - width);
                    }
                    break;
                case 39: // Right
                    if (pacmanCurrentIndex % width < width - 1 && !newSquares[pacmanCurrentIndex + 1].includes('wall')) {
                        setPacmanCurrentIndex(pacmanCurrentIndex + 1);
                    }
                    break;
                case 40: // Down
                    if (pacmanCurrentIndex + width < width * width && !newSquares[pacmanCurrentIndex + width].includes('wall')) {
                        setPacmanCurrentIndex(pacmanCurrentIndex + width);
                    }
                    break;
                default:
                    break;
            }

            newSquares[pacmanCurrentIndex] = newSquares[pacmanCurrentIndex] + ' pac-man';
            return newSquares;
        });
    }, [width, pacmanCurrentIndex, setPacmanCurrentIndex, setSquares]);

  const pacmanMove = () => {
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
  };

  const handle_movements = () => {
    pacmanMove();
    if (inputMemory.current > 0) {
      pacmanSteer(); // change deltaX/Y if turning is valid
    }
    inputMemory.current -= 1;

    //create ghosts using Constructor
    class Ghost {
        constructor(className, startIndex, speed) {
            this.className = className
            this.startIndex = startIndex
            this.speed = speed
            this.currentIndex = startIndex
            this.isScared = false
            this.timerId = NaN

        }
    }

    //all my ghosts
    const ghosts = [
        new Ghost("blinky", 348, 250),
        new Ghost("pinky", 376, 400),
        new Ghost("inky", 351, 300),
        new Ghost("clyde", 379, 500),
    ]

    //draw my ghosts onto the grid
    ghosts.forEach(ghost =>
        squares[ghost.currentIndex].classList.add(ghost.className, "ghost"))

    //move ghosts randomly
    ghosts.forEach(ghost => moveGhost(ghost))

    function moveGhost(ghost) {
        const directions = [-1, 1, width, -width]
        let direction = directions[Math.floor(Math.random() * directions.length)]

        ghost.timerId = setInterval(function () {
            //if next square your ghost is going to go to does not have a ghost and does not have a wall
            if (
                !squares[ghost.currentIndex + direction].classList.contains("ghost") &&
                !squares[ghost.currentIndex + direction].classList.contains("wall")
            ) {
                squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
                ghost.currentIndex += direction
                squares[ghost.currentIndex].classList.add(ghost.className, "ghost")
                // else find a new random direction to go in
            } else direction = directions[Math.floor(Math.random() * directions.length)]
            // if the ghost is currently scared
            if (ghost.isScared) {
                squares[ghost.currentIndex].classList.add("scared-ghost")
            }

            //if the ghost is currently scared and pacman is on it
            if (ghost.isScared && squares[ghost.currentIndex].classList.contains("pac-man")) {
                ghost.isScared = false
                squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
                ghost.currentIndex = ghost.startIndex
                score.current += 100
                squares[ghost.currentIndex].classList.add(ghost.className, "ghost")
            }
            checkForGameOver()
        }, ghost.speed)
    }

    //check for a game over
    function checkForGameOver() {
        if (
            squares[pacmanCurrentIndex].classList.contains("ghost") &&
            !squares[pacmanCurrentIndex].classList.contains("scared-ghost")) {
            ghosts.forEach(ghost => clearInterval(ghost.timerId))
            document.removeEventListener("keyup", movePacman)
            setTimeout(function () {
                alert("Game Over")
            }, 500)
        }
    }
    /* TODO: Ghosts
    for (g of ghosts) {
      g.routeAI(pman.pos, map); 
      g.move();
    }
    */
  };

  const handle_collisions = () => {
    // pick-up collisions
    for (let grid of getPacmanGrids(pacmanXRef.current, pacmanYRef.current)) {
      if (dots.current.some(dot => dot.x === grid.x && dot.y === grid.y)) { // Within grid with pick-up
        score.current += PICKUP_SCORE;
        dots.current = dots.current.filter(dot => dot.x !== grid.x || dot.y !== grid.y);
        console.log("PICKUP");
      }
    }

    // TODO
  };

  // Game Initialization
  useEffect(() => {
    // Init game map
    map.current = generateMap();
    dots.current = generateDots();
      generateSquares();
    
      document.addEventListener('keyup', movePacman);

    // Setup Game Logic to run per tick
    const interval = setInterval(() => {
      handle_movements()
	    handle_collisions()
    }, 1000 / 60); // 60 ticks per second

    return () => {
        clearInterval(interval);
        document.removeEventListener('keyup', movePacman);
    }
  }, [generateSquares, handle_collisions, handle_movements, movePacman]);

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
      <div className="grid">
          {squares.map((square, index) => (
              <div key={index} className={`square ${square}`}></div>
          ))}
      </div>
  );
};

export default PacmanGame;