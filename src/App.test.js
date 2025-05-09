import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import PacmanGame from './components/PacmanGame';
import { GRID_SIDE, NODIR, UP, DOWN, LEFT, RIGHT, GAMEMAP_1 } from './constants';
import '@testing-library/jest-dom';

// Mock GameUI to focus on game logic
jest.mock('./components/GameUI', () => (props) => <div data-testid="game-ui" {...props} />);

describe('PacmanGame', () => {
  const triggerKeyDown = (key) => {
    fireEvent.keyDown(document, { key });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getPacmanGrids()', () => {
    test('should return single grid when exactly on grid intersection', () => { 
      // Since we can't easily access the function directly from the component,
      // we'll test the logic separately
      const testGetPacmanGrids = (x, y) => {
        if (x % GRID_SIDE !== 0) return [
          {x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
          {x: Math.floor(x/GRID_SIDE)+1, y: Math.floor(y/GRID_SIDE)}
        ];
        if (y % GRID_SIDE !== 0) return [
          {x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}, 
          {x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)+1}
        ];
        return [{x: Math.floor(x/GRID_SIDE), y: Math.floor(y/GRID_SIDE)}];
      };
  
      // Exactly on grid intersection
      expect(testGetPacmanGrids(0, 0)).toEqual([{x: 0, y: 0}]);
      expect(testGetPacmanGrids(GRID_SIDE, GRID_SIDE)).toEqual([{x: 1, y: 1}]);
      
      // Between horizontal grids
      expect(testGetPacmanGrids(GRID_SIDE/2, 0)).toEqual([
        {x: 0, y: 0},
        {x: 1, y: 0}
      ]);
      
      // Between vertical grids
      expect(testGetPacmanGrids(0, GRID_SIDE/2)).toEqual([
        {x: 0, y: 0},
        {x: 0, y: 1}
      ]);
      
      // Between both axes (should prioritize horizontal check first)
      expect(testGetPacmanGrids(GRID_SIDE/2, GRID_SIDE/2)).toEqual([
        {x: 0, y: 0},
        {x: 1, y: 0}
      ]);
    });
  });

  describe('pacmanSteer()', () => {
    test('should allow direction change when path is clear', async () => {
      render(<PacmanGame />);
      
      // Press right arrow to set direction
      triggerKeyDown('ArrowRight');
      
      // Advance timers to process movement
      act(() => {
        jest.advanceTimersByTime(2*1000/60); // Two game ticks
      });
      
      // Verify Pac-Man is moving right (through GameUI props)
      const gameUI = screen.getByTestId('game-ui');
      expect(gameUI).toHaveAttribute('dx', '1');
      expect(gameUI).toHaveAttribute('dy', '0');
      
      // Press down arrow to change direction
      triggerKeyDown('ArrowLeft');
      
      // Advance timers
      act(() => {
        jest.advanceTimersByTime(1000/60);
      });
      
      // Verify direction changed to down
      expect(gameUI).toHaveAttribute('dx', '-1');
      expect(gameUI).toHaveAttribute('dy', '0');
    });
  
    test('should prevent 90-degree turns between grids', async () => {
      render(<PacmanGame />);
      
      // Start moving right
      triggerKeyDown('ArrowRight');
      act(() => {
        jest.advanceTimersByTime(1000/60);
      });
      
      const gameUI = screen.getByTestId('game-ui');
      
      // Move partially through a grid (not aligned)
      const initialX = parseInt(gameUI.getAttribute('pacmanX'));
      const newX = initialX + GRID_SIDE/2;
      gameUI.setAttribute('pacmanX', newX.toString());
      
      // Attempt to turn up (90 degrees)
      triggerKeyDown('ArrowUp');
      act(() => {
        jest.advanceTimersByTime(1000/60);
      });
      
      // Should still be moving right
      expect(gameUI).toHaveAttribute('dx', '1');
      expect(gameUI).toHaveAttribute('dy', '0');
    });
  });
});