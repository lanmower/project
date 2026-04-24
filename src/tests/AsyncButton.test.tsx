import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AsyncButton } from '../components/common/AsyncButton';

test('AsyncButton shows loading state', async () => {
  const mockAsyncFunction = jest.fn().mockResolvedValueOnce();
  
  render(<AsyncButton onAsyncClick={mockAsyncFunction}>Click Me</AsyncButton>);
  
  const button = screen.getByText(/Click Me/i);
  fireEvent.click(button);
  
  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  expect(mockAsyncFunction).toHaveBeenCalled();
});
