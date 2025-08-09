import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Button from './Button';

test('button click', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(onClick).toHaveBeenCalled();
});