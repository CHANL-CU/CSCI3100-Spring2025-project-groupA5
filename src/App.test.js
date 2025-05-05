import { render, screen } from '@testing-library/react';
import PacmanGame from './components/PacmanGame.js'

test('renders learn react link', () => {
  render(<PacmanGame />);
  const linkElement = screen.getByText(/Pacman is now at/i);
  expect(linkElement).toBeInTheDocument();
});
