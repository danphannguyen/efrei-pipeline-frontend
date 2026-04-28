import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello world', async () => {
  render(<App />);
  const titleElement = screen.getByText(/Pipeline Frontend/i);
  expect(titleElement).toBeInTheDocument();
});