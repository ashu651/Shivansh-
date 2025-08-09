"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import PostCard from '../../components/feed/PostCard';

export default function FeedPage() {
  const { data } = useQuery({ queryKey: ['feed'], queryFn: async () => api.get('/posts/feed') });
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Feed</h1>
      <div className="space-y-3">
        {data?.posts?.map((p: any) => (
          <PostCard key={p.id} post={p} onLike={() => {}} onComment={() => {}} onShare={() => {}} />
        ))}
      </div>
    </main>
  );
}