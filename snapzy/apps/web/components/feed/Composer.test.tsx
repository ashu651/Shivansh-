import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Composer from './Composer';

test('composer submits text', () => {
  const onSubmit = jest.fn();
  render(<Composer onSubmit={onSubmit} />);
  fireEvent.change(screen.getByLabelText('Post text'), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByText('Post'));
  expect(onSubmit).toHaveBeenCalled();
});