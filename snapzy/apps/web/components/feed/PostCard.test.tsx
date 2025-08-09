import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PostCard, { Post } from './PostCard';

test('renders post and triggers like', () => {
  const post: Post = { id: '1', author: { username: 'alice' }, caption: 'hello', media: [{ public_id: 'x', url: 'https://example.com/a.jpg' }], createdAt: new Date().toISOString() };
  const onLike = jest.fn();
  render(<PostCard post={post} onLike={onLike} onComment={() => {}} onShare={() => {}} />);
  fireEvent.click(screen.getByLabelText('Like'));
  expect(onLike).toHaveBeenCalledWith('1');
});