import { z } from 'zod'

const schema = z
  .object({
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_JWT_KEY: z.string().min(1).optional(),
    EXPECTED_CLERK_ORG_ID: z.string().min(1),
    FRONTEND_URL: z.string().url(),
    CUSTOMER_SLUG: z.string().min(1).default('local'),
    AI_PROVIDER: z.enum(['mock', 'openai', 'vercel-gateway']).default('mock'),
    AI_GATEWAY_API_KEY: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
    OPENAI_API_KEY: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
  })
  .superRefine((value, context) => {
    if (value.AI_PROVIDER === 'openai' && !value.OPENAI_API_KEY) {
      context.addIssue({
        code: 'custom',
        path: ['OPENAI_API_KEY'],
        message: 'OPENAI_API_KEY is required when AI_PROVIDER=openai',
      })
    }
  })

export const env = schema.parse(process.env)
