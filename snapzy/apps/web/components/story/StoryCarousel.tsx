import { FC } from 'react';

export interface Story { id: string; mediaUrl: string; author: { username: string }; }
export interface StoryCarouselProps { stories: Story[] }

const StoryCarousel: FC<StoryCarouselProps> = ({ stories }) => {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {stories.map((s) => (
        <div key={s.id} className="w-24 h-40 bg-slate-100 rounded shrink-0 flex items-end p-1">
          <span className="text-xs">{s.author.username}</span>
        </div>
      ))}
    </div>
  );
};
export default StoryCarousel;