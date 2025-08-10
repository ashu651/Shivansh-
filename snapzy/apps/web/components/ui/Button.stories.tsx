import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = { title: 'App/UI/Button', component: Button };
export default meta;

export const Primary: StoryObj<typeof Button> = { args: { children: 'Primary', variant: 'primary' } };
export const Secondary: StoryObj<typeof Button> = { args: { children: 'Secondary', variant: 'secondary' } };
export const Ghost: StoryObj<typeof Button> = { args: { children: 'Ghost', variant: 'ghost' } };