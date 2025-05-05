import React from 'react';
import styled from 'styled-components';

// place to display game
const GameContainer = styled.svg`
  width: 80vw;
  height: 90vh;
  background: black;
`;

// pacman appearance
const PacmanAppearance = styled.circle`
  fill: #FFFF00;
`;

// Usage: ./PacmanGame.js
// Display game interface given required data
const GameUI = ({pacmanX,
  pacmanY, map}) => {
  const cellSize = 20; // Pixels per grid cell

  // Render map as a grid
  const mapTiles = map.flatMap((row, y) =>
    row.map((cell, x) => (
      <rect
        key={`${x}-${y}`}
        x={x * cellSize}
        y={y * cellSize}
        width={cellSize}
        height={cellSize}
        fill={cell === 1 ? "blue" : "black" } //blue colour if wall, else,then black
      />
    ))
  );
  
  // Render pacman by pacmanX and pacmanY
  const pacmanPlace = (
    <PacmanAppearance
      key="pacman"
      cx={pacmanX + Math.floor(cellSize/2)}
      cy={pacmanY + Math.floor(cellSize/2)}
      r={8}
    />
    );

  return (
    <div>
      <p>Pacman is now at [{pacmanX}, {pacmanY}]!</p>
      <GameContainer viewBox={`0 0 ${map[0]?.length * cellSize} ${map.length * cellSize}`}>
        {/* Render map */}
        {mapTiles}
        {/* Render Pac-Man */}
        {pacmanPlace}
      </GameContainer>
    </div>
  );
};


export default GameUI;
