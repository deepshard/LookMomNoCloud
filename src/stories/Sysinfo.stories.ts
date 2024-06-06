import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SystemInfo from '../component/SystemInfo';

const meta = {
    title: 'Components/SysInfo',
    component: SystemInfo,
    parameters: {
      // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
      layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
      backgroundColor: { control: 'color' },
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: { onClick: fn() },
  } satisfies Meta<typeof SystemInfo>;
  
  export default meta;
  type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    backgroundColor: 'black',
    modalColor: 'blue',
    runningModels: [],
    usage: {
      memory: 50,
      storage: 50,
    },
    systemName: '4090 RTX'
  },
};