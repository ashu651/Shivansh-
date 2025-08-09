import type { Meta, StoryObj } from '@storybook/react';
import PostCard from './PostCard';

const meta: Meta<typeof PostCard> = { title: 'App/Feed/PostCard', component: PostCard };
export default meta;

export const Default: StoryObj<typeof PostCard> = {
  args: {
    post: { id: '1', author: { username: 'alice' }, caption: 'Hello', media: [{ public_id: 'x', url: 'https://picsum.photos/600/400' }], createdAt: new Date().toISOString() },
    onLike: () => {},
    onComment: () => {},
    onShare: () => {},
  },
};
}