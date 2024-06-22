import ModelWidget from "../../component/ModelWidget";

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof ModelWidget> = {
  title: 'Components/ModedlWidget',
  component: ModelWidget,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    model: { control: 'object' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof ModelWidget>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const base: Story = {
  args: {
    model:{
        "id": "1293854612354123",
        "name": "Vivacem/Mistral-7B-MMIQC",
        "title": "Mistral-7B-MMIQC",
        "size": 7241732096,
        "author": "Vivacem",
        "downloads": 5246,
        "likes": 2,
        "intro": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
        "capabilities": "Mistral-7B-MMIQC showcases improved performance in mathematical tasks, specifically achieving 36.0% test accuracy on the MATH dataset.",
        "risks": "",
        "hfLink": "https://huggingface.co/Vivacem/Mistral-7B-MMIQC",
        "createdAt": "2024-01-17 15:14:41",
        "modifiedAt": "2024-01-18 03:59:19",
        "status": "NOT_DOWNLOADED",
        "backgroundImage": "https://storage.googleapis.com/model_background_images/00008edc-8bb4-4b45-a60c-43dd70215cd7.png",
        "description": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
        "params": 7241732096
    }
  },
};
