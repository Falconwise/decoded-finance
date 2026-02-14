import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        company: z.string(),
        sector: z.string(),
        ipo_date: z.string(),
        offer_price: z.number().optional(),
        valuation_sar: z.number().optional(),
        recommendation: z.enum(['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell', 'Not Rated']),
        target_price: z.number().optional(),
        reading_time: z.number(),
        author: z.string().default('Abdul Gaffar Mohammed, CFA'),
        publishedDate: z.string(),
        tags: z.array(z.string()),
        description: z.string(),
        ogImage: z.string().optional(),
    }),
});

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        author: z.string().default('Abdul Gaffar Mohammed, CFA'),
        publishedDate: z.string(),
        reading_time: z.number(),
        tags: z.array(z.string()),
        description: z.string(),
        featured: z.boolean().default(false),
        ogImage: z.string().optional(),
    }),
});

export const collections = { 'case-studies': caseStudies, blog };
