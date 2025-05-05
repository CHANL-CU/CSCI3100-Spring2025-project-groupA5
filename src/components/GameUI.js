import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Place to display game
const GameContainer = styled.svg`
  width: 80vw;
  height: 90vh;
  background: black;
`;

// Pacman appearance
const PacmanAppearance = styled.circle`
  fill: #FFFF00;
`;

// Pacman eyes
const PacmanEye = styled.circle`
  fill: black;
`;

// Pacman mouth (sector)
const PacmanMouth = styled.path`
  fill: black;
  transition: d 0.2s ease-in-out;
`;

const GameUI = ({ pacmanX, pacmanY, map, deltaX, deltaY,dots,score, lastDirection}) => {
  const cellSize = 20; // Pixels per grid cell
  const [mouthAngle, setMouthAngle] = useState(30); // Initial mouth opening angle

  // Animate Pac-Man's mouth opening and closing
  useEffect(() => {
    const interval = setInterval(() => {
      setMouthAngle(prev => (prev === 30 ? 5 : 30)); // Toggle between 30° and 5°
    }, 300);
    return () => clearInterval(interval);
  }, []);


  // Calculate mouth sector path
  const startX = 10 + 8 * Math.cos(Math.PI * mouthAngle / 180);
  const startY = 10 + 8 * Math.sin(Math.PI * mouthAngle / 180);
  const endX = 10 + 8 * Math.cos(Math.PI * -mouthAngle / 180);
  const endY = 10 + 8 * Math.sin(Math.PI * -mouthAngle / 180);
  
  // Sector mouth path (convex outward)
  const mouthPath = `M 10 10 L ${startX} ${startY} A 8 8 0 0 1 ${endX} ${endY} Z`;

  // Render map as a grid
  const mapTiles = map.flatMap((row, y) =>
    row.map((cell, x) => (
      <rect
        key={`${x}-${y}`}
        x={x * cellSize}
        y={y * cellSize}
        width={cellSize}
        height={cellSize}
        fill={cell === 1 ? "blue" : "black"}
      />
    ))
  );

  // Render yellow dots
  const dotElements = dots.map((dot, index) => (
    <circle key={index} cx={dot.x * cellSize + cellSize / 2} cy={dot.y * cellSize + cellSize / 2} r={4} fill="yellow" />
  ));


  // Render Pac-Man as a group with rotation
  const pacmanPlace = (
    <g transform={`translate(${pacmanX * cellSize}, ${pacmanY * cellSize}) rotate(${lastDirection} ${cellSize / 2} ${cellSize / 2})`}>
      <PacmanAppearance cx={10} cy={10} r={8} />
      <PacmanEye cx={10} cy={lastDirection === 180 ? 15 : 4} r={1.5} />
      <PacmanMouth d={mouthPath} />
    </g>
  );

  return (
    <div>
      <p>This is where the game is displayed.</p>
      <p>Pacman is now at [{pacmanX}, {pacmanY}],score=[{score}]</p>
      <GameContainer viewBox={`0 0 ${map[0]?.length * cellSize} ${map.length * cellSize}`}>
        {/* Render map */}
        {mapTiles}
        {/*render dots*/}
        {dotElements}
        {/* Render Pac-Man */}
        {pacmanPlace}
      </GameContainer>
    </div>
  );
};

export default GameUI;
