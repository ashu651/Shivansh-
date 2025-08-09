import type { Meta, StoryObj } from '@storybook/react';
import { UIButton } from './Button';

const meta: Meta<typeof UIButton> = {
  title: 'UI/UIButton',
  component: UIButton,
};
export default meta;

export const Primary: StoryObj<typeof UIButton> = { args: { children: 'Primary', variant: 'primary' } };
export const Secondary: StoryObj<typeof UIButton> = { args: { children: 'Secondary', variant: 'secondary' } };
export const Ghost: StoryObj<typeof UIButton> = { args: { children: 'Ghost', variant: 'ghost' } };