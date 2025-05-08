import React, { useState, useEffect, useRef } from 'react';
import GameUI from './GameUI.js';
const { GRID_SIDE, MAX_MEM, NODIR, UP, DOWN, LEFT, RIGHT, GAMEMAP_1, PICKUP_SCORE } = require('../constants.js');
const { Ghost, initializeGhosts } = require('./Ghost.js');

const PacmanGame = () => {
  const [pacmanX, setPacmanX] = useState(GAMEMAP_1.initialPacmanX);
  const [pacmanY, setPacmanY] = useState(GAMEMAP_1.initialPacmanY);
  const pacmanXRef = useRef(pacmanX);
  const pacmanYRef = useRef(pacmanY);
  const deltaXRef = useRef(0);
  const deltaYRef = useRef(0);
  const inputMemory = useRef(0);
  const inputDir = useRef(NODIR);
  const map = useRef({ width: 0, height: 0, grids: [] });
  const score = useRef(0);
  const dots = useRef([]);
  const pacmanMoving = useRef(false);

  const ghosts = useRef([]);

  const generateMap = () => {
    const { width, height, map } = GAMEMAP_1;
    const grids = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => +map[x + y * width])
    );
    return { width, height, grids };
  };

  const generateDots = () => {
    const { width, height, grids } = map.current;
    const newDots = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grids[y][x] !== 1 && (x !== pacmanX || y !== pacmanY)) {
          newDots.push({ x, y });
        }
      }
    }
    return newDots;
  };

  const handle_movements = () => {
    // Pac-Man movement
    pacmanMove();
    if (inputMemory.current > 0) {
      pacmanSteer();
    }
    inputMemory.current -= 1;

    // Ghosts movement
    ghosts.current.forEach(ghost => ghost.move());
  };

  const handle_collisions = () => {
    // Pac-Man and dots collision
    for (let grid of getPacmanGrids(pacmanXRef.current, pacmanYRef.current)) {
      if (dots.current.some(dot => dot.x === grid.x && dot.y === grid.y)) {
        score.current += PICKUP_SCORE;
        dots.current = dots.current.filter(dot => dot.x !== grid.x || dot.y !== grid.y);
      }
    }

    // Pac-Man and ghosts collision
    ghosts.current.forEach(ghost => {
      if (ghost.checkCollision(pacmanXRef.current, pacmanYRef.current)) {
        console.log("Game Over! Pac-Man collided with a Ghost.");
        clearInterval(gameLoop);
      }
    });
  };

  useEffect(() => {
    map.current = generateMap();
    dots.current = generateDots();
    ghosts.current = initializeGhosts(map.current);

    const gameLoop = setInterval(() => {
      handle_movements();
      handle_collisions();
    }, 1000 / 60); // 60 ticks per second

    return () => clearInterval(gameLoop);
  }, []);

  return (
    <div>
      <GameUI pacmanX={pacmanX} pacmanY={pacmanY}
        map={map.current.grids} dots={dots.current}
        ghosts={ghosts.current.map(({ x, y }) => ({ x, y }))}
        score={score.current}
      />
    </div>
  );
};

export default PacmanGame;