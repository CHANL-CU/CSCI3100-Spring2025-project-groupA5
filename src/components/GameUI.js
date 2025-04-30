import React from 'react';
import styled from 'styled-components';

// place to display game
const GameContainer = styled.svg`
  width: 600px;
  height: 400px;
  background: black;
`;


// Usage: ./PacmanGame.js
// Display game interface given required data
const GameUI = ({pacmanX,
  pacmanY, map, score}) => {
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
  
  return (
    <div>
      <p>This is where the game is displayed.</p>
      <p>Pacman is now at [{pacmanX}, {pacmanY}]!</p>
      <GameContainer viewBox={`0 0 ${map[0]?.length * cellSize} ${map.length * cellSize}`}>
        {/* Render map */}
        {mapTiles}
      </GameContainer>
    </div>
  );
};


export default GameUI;
