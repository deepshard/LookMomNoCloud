import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ModelCarousel from '../../component/ModelCarousel';



// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof ModelCarousel> = {
    title: 'Components/ModelWidget',
    component: ModelCarousel,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        models: { control: 'object' },
        isLoading: { control: 'boolean' },
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: { },
};

export default meta;
type Story = StoryObj<typeof ModelCarousel>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const AllModels: Story = {
    args: {
        isLoading: true,
        models: [
            {
                "id": "1293854612354123",
                "name": "Meta/LLaMA-3",
                "title": "LLaMA-3",
                "size": 7241732096,
                "author": "Meta",
                "downloads": 5246,
                "likes": 2,
                "intro": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "capabilities": "Mistral-7B-MMIQC showcases improved performance in mathematical tasks, specifically achieving 36.0% test accuracy on the MATH dataset.",
                "risks": "",
                "hfLink": "https://huggingface.co/Vivacem/Mistral-7B-MMIQC",
                "createdAt": "2024-01-17 15:14:41",
                "modifiedAt": "2024-01-18 03:59:19",
                "status": "NOT_DOWNLOADED",
                "backgroundImage": "https://storage.googleapis.com/model_background_images/222c1658-f3b4-46ae-94b6-b1d8d6ecc605.png",
                "description": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "params": 7241732096
            },
            {
                "id": "1293854612354123",
                "name": "Microsoft/Phi-3",
                "title": "Phi-3",
                "size": 7241732096,
                "author": "Microsoft",
                "downloads": 5246,
                "likes": 2,
                "intro": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "capabilities": "Mistral-7B-MMIQC showcases improved performance in mathematical tasks, specifically achieving 36.0% test accuracy on the MATH dataset.",
                "risks": "",
                "hfLink": "https://huggingface.co/Vivacem/Mistral-7B-MMIQC",
                "createdAt": "2024-01-17 15:14:41",
                "modifiedAt": "2024-01-18 03:59:19",
                "status": "STOPPED",
                "backgroundImage": "https://storage.googleapis.com/model_background_images/22c623bc-3c00-469f-8091-3a5c23f7ab64.png",
                "description": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "params": 7241732096
            },
            {
                "id": "1293854612354123",
                "name": "Yukang/LongAlpaca",
                "title": "LongAlpaca",
                "size": 7241732096,
                "author": "Yukang",
                "downloads": 5246,
                "likes": 2,
                "intro": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "capabilities": "Mistral-7B-MMIQC showcases improved performance in mathematical tasks, specifically achieving 36.0% test accuracy on the MATH dataset.",
                "risks": "",
                "hfLink": "https://huggingface.co/Vivacem/Mistral-7B-MMIQC",
                "createdAt": "2024-01-17 15:14:41",
                "modifiedAt": "2024-01-18 03:59:19",
                "status": "RUNNING",
                "backgroundImage": "https://storage.googleapis.com/model_background_images/1c71c986-0919-46db-879e-c52c23935bc1.png",
                "description": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "params": 7241732096
            },
            {
                "id": "1293854612354123",
                "name": "allknowingroger/QuantumBruins-slerp",
                "title": "QuantumBruins-slerp",
                "size": 7241732096,
                "author": "allknowingroger",
                "downloads": 5246,
                "likes": 2,
                "intro": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "capabilities": "Mistral-7B-MMIQC showcases improved performance in mathematical tasks, specifically achieving 36.0% test accuracy on the MATH dataset.",
                "risks": "",
                "hfLink": "https://huggingface.co/Vivacem/Mistral-7B-MMIQC",
                "createdAt": "2024-01-17 15:14:41",
                "modifiedAt": "2024-01-18 03:59:19",
                "status": "DOWNLOADING",
                "progress": 51,
                "backgroundImage": "https://storage.googleapis.com/model_background_images/22e42b2c-678e-4cdd-b8dc-232b5dc36dc6.png",
                "description": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "params": 7241732096
            },
            {
                "id": "1293854612354123",
                "name": "allknowingroger/CodeBooga",
                "title": "CodeBooga",
                "size": 32241732096,
                "author": "oobabooga",
                "downloads": 5246,
                "likes": 2,
                "intro": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "capabilities": "Mistral-7B-MMIQC showcases improved performance in mathematical tasks, specifically achieving 36.0% test accuracy on the MATH dataset.",
                "risks": "",
                "hfLink": "https://huggingface.co/Vivacem/Mistral-7B-MMIQC",
                "createdAt": "2024-01-17 15:14:41",
                "modifiedAt": "2024-01-18 03:59:19",
                "status": "DOWNLOADING",
                "progress": 51,
                "backgroundImage": "https://storage.googleapis.com/model_background_images/22acd463-486e-42eb-a8a0-7c724d4eea63.png",
                "description": "Mistral-7B-MMIQC is obtained by fine-tuning Mistral-7B on MMIQC. It is aimed at improving test accuracy on mathematical datasets, achieving 36.0% test accuracy on MATH.",
                "params": 32241732096
            }
        ]
    },
};