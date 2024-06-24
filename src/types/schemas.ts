import { on } from 'events';
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
    instance: z.number().optional(),
    progress: z.number().optional(),
    description: z.string(),
    params: z.number(),
    error: z.string().optional(),
    onInstall: z.function().optional(),
    onRun: z.function().optional(),
    onStop: z.function().optional(),
    onDelete: z.function().optional(),
    onDisconnect: z.function().optional(),
    onClick: z.function().optional(),
})

export type TModel = Infer<typeof ModelSchema>;
export type TSysInfo = Infer<typeof SysinfoSchema>;