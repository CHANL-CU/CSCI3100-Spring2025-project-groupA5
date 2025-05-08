// Ghost.js
import React, { useState, useEffect, useRef } from 'react';
import { GRID_SIDE, NODIR, UP, DOWN, LEFT, RIGHT } from '../constants.js';

const Ghost = ({ id, initialX, initialY, map, pacmanX, pacmanY, onCollide }) => {
  const [ghostX, setGhostX] = useState(initialX);
  const [ghostY, setGhostY] = useState(initialY);
  const ghostXRef = useRef(ghostX);
  const ghostYRef = useRef(ghostY);
  const [direction, setDirection] = useState(NODIR);
  const directionRef = useRef(direction);
  const speed = 1; // Adjust as needed

  useEffect(() => {
    ghostXRef.current = ghostX;
    ghostYRef.current = ghostY;
    directionRef.current = direction;
  }, [ghostX, ghostY, direction]);

  // Function to check for collisions with Pac-Man
  const checkCollision = () => {
    const distance = Math.sqrt(
      Math.pow(pacmanX - ghostX, 2) + Math.pow(pacmanY - ghostY, 2)
    );
    if (distance < GRID_SIDE) {
      onCollide(); // Notify the game that a collision occurred
    }
  };

  // AI to determine the ghost's movement
  const moveGhost = () => {
    if (!map || map.length === 0) return;

    const possibleDirections = [];

    // Check for available directions (excluding the opposite of the current direction)
    if (directionRef.current !== DOWN && map[ghostYRef.current - 1]?.[ghostXRef.current] !== 1) {
      possibleDirections.push(UP);
    }
    if (directionRef.current !== UP && map[ghostYRef.current + 1]?.[ghostXRef.current] !== 1) {
      possibleDirections.push(DOWN);
    }
    if (directionRef.current !== RIGHT && map[ghostYRef.current]?.[ghostXRef.current - 1] !== 1) {
      possibleDirections.push(LEFT);
    }
    if (directionRef.current !== LEFT && map[ghostYRef.current]?.[ghostXRef.current + 1] !== 1) {
      possibleDirections.push(RIGHT);
    }

    // If there are no valid directions, try to reverse the current direction
    if (possibleDirections.length === 0) {
      switch (directionRef.current) {
        case UP:
          setDirection(DOWN);
          break;
        case DOWN:
          setDirection(UP);
          break;
        case LEFT:
          setDirection(RIGHT);
          break;
        case RIGHT:
          setDirection(LEFT);
          break;
        default:
          setDirection(NODIR);
      }
      return;
    }

    // Choose a random direction from the available directions
    const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    setDirection(newDirection);

    // Move the ghost based on the chosen direction
    let newX = ghostXRef.current;
    let newY = ghostYRef.current;

    switch (newDirection) {
      case UP:
        newY -= speed;
        break;
      case DOWN:
        newY += speed;
        break;
      case LEFT:
        newX -= speed;
        break;
      case RIGHT:
        newX += speed;
        break;
      default:
        break;
    }

    // Update the ghost's position
    if (map[newY]?.[newX] !== 1) {
      setGhostX(newX);
      setGhostY(newY);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      moveGhost();
      checkCollision();
    }, 200); // Adjust the interval for speed

    return () => clearInterval(intervalId);
  }, [map, pacmanX, pacmanY, onCollide]);

  const ghostStyle = {
    position: 'absolute',
    left: ghostX * GRID_SIDE,
    top: ghostY * GRID_SIDE,
    width: GRID_SIDE,
    height: GRID_SIDE,
    backgroundColor: 'red', // Change color for different ghosts
    borderRadius: '100%',
  };

  return <div style={ghostStyle}></div>;
};

export default Ghost;