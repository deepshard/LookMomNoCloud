

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Placeholder } from '../../component/MyModels';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof Placeholder> = {
    title: 'Components/Carousel',
    component: Placeholder,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        cards: { control: 'object' },
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof Placeholder>;

export const simple: Story = {
};