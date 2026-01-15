import { defineCollection, z } from 'astro:content';

const productsCollection = defineCollection({
    type: 'data', // Формат данных (JSON/YAML)
    schema: z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
        category: z.string(),
        collection: z.string().optional(),
        image: z.string(),
        description: z.string(),
        sizes: z.array(z.string()),
        composition: z.string().optional(),
        characteristics: z.array(z.object({
            name: z.string(),
            value: z.string()
        })),
        gallery: z.array(z.string()),
        isAvailable: z.boolean(),
        isPopular: z.boolean().optional()
    })
});

export const collections = {
    'products': productsCollection,
};
