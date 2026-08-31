import { z } from 'zod'

export const jokeStatusSchema = z.enum(['draft', 'published', 'archived'])
export const jokeIdSchema = z.string().uuid()
export const shareTokenSchema = z.string().uuid()

const tagsSchema = z
  .array(z.string().trim().min(1).max(24))
  .max(8)
  .refine(
    (tags) =>
      new Set(tags.map((tag) => tag.toLowerCase())).size === tags.length,
    { message: 'Tags must be unique' },
  )

export const jokeSchema = z.object({
  id: jokeIdSchema,
  title: z.string(),
  setup: z.string(),
  punchline: z.string(),
  tags: z.array(z.string()),
  status: jokeStatusSchema,
  createdByUserId: z.string(),
  shareUrl: z.string().url().nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createJokeInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  setup: z.string().trim().min(1).max(500),
  punchline: z.string().trim().min(1).max(500),
  tags: tagsSchema.default([]),
})

export const updateJokeInputSchema = createJokeInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required',
  })

export const dashboardSchema = z.object({
  total: z.number().int(),
  draft: z.number().int(),
  published: z.number().int(),
  archived: z.number().int(),
  recent: z.array(jokeSchema),
})

export const shareJokeResultSchema = z.object({
  joke: jokeSchema,
  shareUrl: z.string().url(),
  publishedAt: z.string().datetime(),
})

export const publicJokeSchema = z.object({
  title: z.string(),
  setup: z.string(),
  punchline: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.string().datetime(),
})

export type JokeStatus = z.infer<typeof jokeStatusSchema>
export type JokeDto = z.infer<typeof jokeSchema>
export type CreateJokeInput = z.infer<typeof createJokeInputSchema>
export type UpdateJokeInput = z.infer<typeof updateJokeInputSchema>
export type DashboardDto = z.infer<typeof dashboardSchema>
export type ShareJokeResult = z.infer<typeof shareJokeResultSchema>
export type PublicJokeDto = z.infer<typeof publicJokeSchema>
