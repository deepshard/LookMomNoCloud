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
    hfLink: z.string(), //hflink
    evalId: z.string().optional(),
    createdAt: z.string(),
    modifiedAt: z.string(),
    status: z.enum([ "ACKNOWLEDGED", "DOWNLOADING", "INSTALLING", "RUNNING", "STOPPED", "NOT_DOWNLOADED"]),
    backgroundImage: z.string(),
    port: z.number().optional(),
    instance: z.number().optional(),
    progress: z.number().optional(),
    description: z.string(),
    params: z.number(),
    error: z.string().optional(),
})

const NewsSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    imageUrl: z.string().optional(),
    userProfilePicture: z.string(),
    url: z.string(),
    createdAt: z.string(),
})

export type TModel = Infer<typeof ModelSchema>;
export type TSysInfo = Infer<typeof SysinfoSchema>;
export type TNews = Infer<typeof NewsSchema>;