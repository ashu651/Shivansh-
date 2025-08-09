'use client';
import { FC, ReactNode, useEffect, useRef } from 'react';

export interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }
const Modal: FC<ModalProps> = ({ open, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div role="document" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()} className="bg-white rounded p-4 w-full max-w-md outline-none">
        {children}
        <button className="sr-only" onClick={onClose} aria-label="Close">Close</button>
      </div>
    </div>
  );
};
export default Modal;