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
    instance: z.number(),
    url: z.string(), //hflink
    status: z.enum(["DOWNLOADING", "INSTALLING", "RUNNING", "STOPPED", "NOT_INSTALLED"]),
    progress: z.number().optional(),
    backgroundImage: z.string(),
    author: z.string(),
    name: z.string(),
    params: z.number(),
    error: z.string().optional(),
})

export type TModel = Infer<typeof ModelSchema>;
export type TSysInfo = Infer<typeof SysinfoSchema>;