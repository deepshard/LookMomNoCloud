import { infer as Infer, z } from 'zod';

export const SysinfoSchema = z.object({
    os: z.string(),
    resources: z.object({
        available: z.object({
            ram: z.number(),
            disk: z.number(),
        }),
        models: z.array(z.any()),
        total: z.object({
            ram: z.number(),
            disk: z.number(),
        }),
    })
});

export const ModelSchema = z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    size: z.number(),
    author: z.string(),
    downloads: z.number(),
    likes: z.number(),
    intro: z.string(),
    capabilities: z.string(),
    risks: z.string(),
    hf_link: z.string(), //hflink
    eval_id: z.string().optional(),
    status: z.enum([ "ACKNOWLEDGED", "DOWNLOADING", "INSTALLING", "RUNNING", "STOPPED", "NOT_DOWNLOADED"]),
    background_image: z.string(),
    instance: z.number().optional(),
    progress: z.number().optional(),
    description: z.string(),
    params: z.number(),
    error: z.string().optional(),
})

export type TModel = Infer<typeof ModelSchema>;
export type TSysInfo = Infer<typeof SysinfoSchema>;