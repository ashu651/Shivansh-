import { FC, useState } from 'react';

export interface MediaItem { public_id: string; url: string; width?: number; height?: number; format?: string }
export interface Post { id: string; author: { username: string }; caption?: string; media: MediaItem[]; createdAt: string; liked?: boolean; likes?: number }

export interface PostCardProps { post: Post; onLike: (id: string) => void; onComment: (id: string, text: string) => void; onShare: (id: string) => void }

const PostCard: FC<PostCardProps> = ({ post, onLike, onComment, onShare }) => {
  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likes || 0);
  return (
    <article className="border rounded p-3">
      <header className="flex items-center justify-between">
        <div className="font-semibold">{post.author.username}</div>
        <div className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</div>
      </header>
      <div className="mt-2 space-y-2">
        {post.caption && <p>{post.caption}</p>}
        {post.media?.[0] && (<img src={post.media[0].url} alt={post.caption || 'post image'} className="w-full rounded" loading="lazy" />)}
      </div>
      <footer className="mt-2 flex gap-3 items-center">
        <button aria-label="Like" aria-pressed={liked} onClick={() => { setLiked((v) => !v); setLikes((n) => (liked ? Math.max(0, n-1) : n+1)); onLike(post.id); }}>{liked ? '♥' : '♡'}</button>
        <span className="text-sm text-slate-600" aria-live="polite">{likes}</span>
        <button aria-label="Comment" onClick={() => onComment(post.id, '')}>💬</button>
        <button aria-label="Share" onClick={() => onShare(post.id)}>↗</button>
      </footer>
    </article>
  );
};

export default PostCard;