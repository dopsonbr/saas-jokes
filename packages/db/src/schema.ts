import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const jokes = pgTable(
  'jokes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    setup: text('setup').notNull(),
    punchline: text('punchline').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    createdByUserId: text('created_by_user_id').notNull(),
    shareToken: uuid('share_token'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex('jokes_share_token_unique').on(table.shareToken)],
)
