import Image from 'next/image';
import { FC } from 'react';

export interface AvatarProps { src?: string; alt: string; size?: number; }
const Avatar: FC<AvatarProps> = ({ src, alt, size = 40 }) => (
  <div className="rounded-full overflow-hidden border border-slate-200" style={{ width: size, height: size }}>
    {src ? <Image src={src} alt={alt} width={size} height={size} /> : <div className="w-full h-full bg-slate-200" aria-label={alt} />}
  </div>
);
export default Avatar;