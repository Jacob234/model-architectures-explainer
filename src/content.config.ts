import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
  schema: z.object({
    title: z.string(),
    tier: z.enum(['primitive', 'module', 'modifier', 'family']),
    kind: z.enum(['architecture', 'generative-framework', 'model-class', 'backbone', 'modifier']).optional(),
    summary: z.string(),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
          type: z.enum(['paper', 'explainer', 'blog', 'video']),
        }),
      )
      .optional(),
  }),
});

export const collections = { concepts };
