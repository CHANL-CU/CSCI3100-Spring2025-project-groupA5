import React from 'react';

// Usage: ./PacmanGame.js
// Display game interface given required data
const GameUI = (props) => {
  return (
    <div>
      <p>This is where the game is displayed.</p>
      <p>Pacman is now at [{props.pacmanX}, {props.pacmanY}]!</p>
    </div>
  );
};

export default GameUI;