import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Modal from './Modal';

const meta: Meta<typeof Modal> = { title: 'App/UI/Modal', component: Modal };
export default meta;

export const Basic: StoryObj<typeof Modal> = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)}>Open</button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="space-y-2">
            <h3 className="font-semibold">Hello</h3>
            <p>Content</p>
          </div>
        </Modal>
      </div>
    );
  },
};