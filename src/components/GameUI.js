import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
const { GRID_WALL, GRID_GATE, UP, DOWN, LEFT, RIGHT } = require('../constants.js');

// Place to display game
const GameContainer = styled.svg`
  width: 80vw;
  height: 90vh;
  background: black;
`;

const Pacman = styled.path`
  transition: d 0.2s ease-in-out;
`;

// Display game interface given required data
const GameUI = ({ pacmanX, pacmanY, map, dots, powerups, dx, dy, pacmanMoving, ghosts, score, colorTheme }) => {
  const cellSize = 20; // Pixels per grid cell
  const pacmanAngle = useRef(359.9); // Initial pacman angle 
  
  // Animate Pac-Man's mouth opening and closing
  useEffect(() => {
    const interval = setInterval(() => {
      pacmanAngle.current = pacmanAngle.current === 310 ? 359.9 : 310; // Pacman animation
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Determine direction and corresponding angle offset
  let dir = 0;
  if (dx === 0) {
    dir = dy === 1 ? 90 : 270; // Down or up
  } else {
    dir = dx === 1 ? 0 : 180; // Right or left
  }

  // Calculate Pac-Man's path based on the angle
  const calculatePacmanPath = () => {
    const radius = 8; // Radius for Pac-Man
    let angle = pacmanAngle.current;
    if (!pacmanMoving) {
      angle = 359.9;
    }
    const startX = radius * Math.cos(Math.PI * (angle / 180));
    const startY = radius * Math.sin(Math.PI * (angle / 180));
    const endX = radius * Math.cos(Math.PI * (-angle / 180));
    const endY = radius * Math.sin(Math.PI * (-angle / 180));
    
    // Create a path for Pac-Man
    return `M 0 0 L ${startX} ${startY} A ${radius} ${radius} 0 1 0 ${endX} ${endY} Z`;
  };

  // Calculate the pacman path based on direction
  const pacmanPath = calculatePacmanPath();

  // Render map as a grid
  const mapTiles = map.flatMap((row, y) =>
    row.map((cell, x) => (
      <rect
        key={`${x}-${y}`}
        x={x * cellSize}
        y={y * cellSize}
        width={cellSize}
        height={cellSize}
        fill={cell === GRID_WALL ? colorTheme[0] : cell === GRID_GATE ? colorTheme[0] : colorTheme[1]}
        style={{opacity: `${cell === GRID_GATE ? 0.67 : 1}`}}
      />
    ))
  );
  
  const dotElements = dots.map((dot, index) => (
    <circle key={index} cx={dot.x * cellSize + cellSize / 2} cy={dot.y * cellSize + cellSize / 2} r={2} fill={colorTheme[2]} />
  ));

  const powerupElements = powerups.map((powerup, index) => (
    <circle key={index} cx={powerup.x * cellSize + cellSize / 2} cy={powerup.y * cellSize + cellSize / 2} r={4} fill={colorTheme[2]} />
  ));

  // Render pacman by pacmanX and pacmanY
  const pacmanPlace = (
    <Pacman d={pacmanPath}
      fill={colorTheme[2]}
      transform={`translate(${pacmanX + Math.floor(cellSize / 2)}, ${pacmanY + Math.floor(cellSize / 2)}) rotate(${dir})`} />
  );

  const dirToAngle = (dir) => {
    switch (dir) {
        case UP: return 270;
        case DOWN: return 90;
        case LEFT: return 180;
        case RIGHT: return 0;
    }
    return 0;
  }

  const ghostColors = ['red', 'pink', 'cyan', 'orange', 'purple', 'green']; //ghost colors
  const fearColor = '#0073E6'; // Dark blue for fear mode
  const skinColor = '#FAD7A0'; // eye color in fear
  const mouthColor = 'pink'; // Pink zig-zag mouth in fear

  const ghostsRender = ghosts.map((ghost, index) => {
  const isScared = ghost.fear > 0; // Check if ghost is in fear mode
  const ghostColor = ghost.fear > 0 ? (ghost.fear <= 180 ? (ghost.fear % 20 > 10 ? 'white ' : fearColor) : fearColor) : ghostColors[index % ghostColors.length];

  return (
    <g key={index} transform={`translate(${ghost.x}, ${ghost.y})`}>
      {/* Ghost Body */}
      <path
        d="M 2 8 
           A 8 8 0 0 1 18 8 
           V 16 
           Q 15 19 12 14
           Q 10 20 6 14
           Q 5 19 2 14
           Z"
        fill={ghostColor} 
      />
      
      {/* Ghost Eyes (Reduced Size in Fear Mode) */}
      <circle cx="6" cy="6" r={isScared ? 2.0 : 2.8} fill={isScared ? skinColor : 'white'} /> {/* Smaller eyes in fear mode */}
      <circle cx="14" cy="6" r={isScared ? 2.0 : 2.8} fill={isScared ? skinColor : 'white'} /> {/* Smaller eyes in fear mode */}
      {!isScared && ( // Pupils only appear when NOT scared
        <>
          <circle cx="6" cy="6" r="1.6" fill="blue" />
          <circle cx="14" cy="6" r="1.6" fill="blue" />
        </>
      )}

      {/* Zig-Zag Mouth (Only in Fear Mode) */}
      {isScared && (
        <path
          d="M 5 12 
             L 7 14 
             L 9 12 
             L 11 14 
             L 13 12 
             L 15 14"
          stroke={mouthColor}
          strokeWidth="1.5"
          fill="none"
        />
      )}
    </g>
  );
});
  return (
    <GameContainer viewBox={`0 0 ${map[0] ? map[0]?.length * cellSize : 0} ${map.length * cellSize}`}>
      {mapTiles}
      {dotElements}
      {powerupElements}
      {pacmanPlace}
      {ghostsRender}
      <text x={map[0] ? map[0]?.length * cellSize - 15 : 0} y={20} fill="white" fontFamily="'Press Start 2P', cursive" fontSize="16">
        Score:{score}
      </text>
    </GameContainer>
  );
};

export default GameUI;