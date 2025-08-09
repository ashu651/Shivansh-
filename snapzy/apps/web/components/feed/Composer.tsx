'use client';
import { FC, useState } from 'react';

export interface ComposerProps { onSubmit: (data: { text: string; media: File[] }) => void }

const Composer: FC<ComposerProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="border p-3 rounded">
      <textarea aria-label="Post text" className="w-full border p-2" value={text} onChange={(e) => setText(e.target.value)} />
      <input type="file" aria-label="Add media" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
      <button className="bg-brand-500 text-white px-3 py-1 rounded" onClick={() => onSubmit({ text, media: files })}>Post</button>
    </div>
  );
};

export default Composer;