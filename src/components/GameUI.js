import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
const { GRID_WALL, GRID_GATE } = require('../constants.js');

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
const GameUI = ({ pacmanX, pacmanY, map, dots, dx, dy, pacmanMoving, ghosts, score, colorTheme }) => {
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

  // Render pacman by pacmanX and pacmanY
  const pacmanPlace = (
    <Pacman d={pacmanPath}
      fill={colorTheme[2]}
      transform={`translate(${pacmanX + Math.floor(cellSize / 2)}, ${pacmanY + Math.floor(cellSize / 2)}) rotate(${dir})`} />
  );

  const ghostsRender = ghosts.map((ghost, index) => (
    <Pacman d={pacmanPath}
      fill={'red'}
      transform={`translate(${ghost.x + Math.floor(cellSize / 2)}, ${ghost.y + Math.floor(cellSize / 2)}) rotate(${dir})`} />
  ));

  return (
    <GameContainer viewBox={`0 0 ${map[0]?.length * cellSize} ${map.length * cellSize}`}>
      {mapTiles}
      {dotElements}
      {pacmanPlace}
      {ghostsRender}
      <text x={map[0]?.length * cellSize - 60} y={20} fill="white" fontFamily="'Press Start 2P', cursive" fontSize="20">
        Score: {score}
      </text>
    </GameContainer>
  );
};

export default GameUI;