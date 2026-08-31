import { randomUUID } from 'node:crypto'
import type {
  CreateJokeInput,
  DashboardDto,
  JokeDto,
  PublicJokeDto,
  ShareJokeResult,
  UpdateJokeInput,
} from '@punchline-hq/contracts'
import { type createDb, schema } from '@punchline-hq/db'
import { and, desc, eq, ne, sql } from 'drizzle-orm'

type Db = ReturnType<typeof createDb>
type JokeRow = typeof schema.jokes.$inferSelect

function toDto(row: JokeRow, frontendUrl: string): JokeDto {
  return {
    id: row.id,
    title: row.title,
    setup: row.setup,
    punchline: row.punchline,
    tags: row.tags,
    status: row.status,
    createdByUserId: row.createdByUserId,
    shareUrl: row.shareToken ? `${frontendUrl}/share/${row.shareToken}` : null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function createJokeService(db: Db, frontendUrl: string) {
  return {
    async dashboard(): Promise<DashboardDto> {
      const [totals, recent] = await Promise.all([
        db
          .select({
            total: sql<number>`count(*)::int`,
            draft: sql<number>`count(*) filter (where ${schema.jokes.status} = 'draft')::int`,
            published: sql<number>`count(*) filter (where ${schema.jokes.status} = 'published')::int`,
            archived: sql<number>`count(*) filter (where ${schema.jokes.status} = 'archived')::int`,
          })
          .from(schema.jokes),
        db
          .select()
          .from(schema.jokes)
          .orderBy(desc(schema.jokes.updatedAt))
          .limit(5),
      ])
      const total = totals[0]
      return {
        total: total?.total ?? 0,
        draft: total?.draft ?? 0,
        published: total?.published ?? 0,
        archived: total?.archived ?? 0,
        recent: recent.map((row) => toDto(row, frontendUrl)),
      }
    },

    async list(): Promise<JokeDto[]> {
      const rows = await db
        .select()
        .from(schema.jokes)
        .orderBy(desc(schema.jokes.updatedAt))
      return rows.map((row) => toDto(row, frontendUrl))
    },

    async get(id: string): Promise<JokeDto | null> {
      const [row] = await db
        .select()
        .from(schema.jokes)
        .where(eq(schema.jokes.id, id))
        .limit(1)
      return row ? toDto(row, frontendUrl) : null
    },

    async create(input: CreateJokeInput, userId: string): Promise<JokeDto> {
      const [row] = await db
        .insert(schema.jokes)
        .values({ ...input, createdByUserId: userId })
        .returning()
      if (!row) throw new Error('Insert failed')
      return toDto(row, frontendUrl)
    },

    async update(id: string, input: UpdateJokeInput): Promise<JokeDto | null> {
      const [row] = await db
        .update(schema.jokes)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(eq(schema.jokes.id, id), ne(schema.jokes.status, 'archived')),
        )
        .returning()
      return row ? toDto(row, frontendUrl) : null
    },

    async share(id: string): Promise<ShareJokeResult | null> {
      const now = new Date()
      const [row] = await db
        .update(schema.jokes)
        .set({
          status: 'published',
          shareToken: randomUUID(),
          publishedAt: now,
          updatedAt: now,
        })
        .where(
          and(eq(schema.jokes.id, id), ne(schema.jokes.status, 'archived')),
        )
        .returning()
      if (!row?.shareToken || !row.publishedAt) return null
      const joke = toDto(row, frontendUrl)
      return {
        joke,
        shareUrl: `${frontendUrl}/share/${row.shareToken}`,
        publishedAt: row.publishedAt.toISOString(),
      }
    },

    async revoke(id: string): Promise<JokeDto | null> {
      const [row] = await db
        .update(schema.jokes)
        .set({
          status: 'draft',
          shareToken: null,
          publishedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(eq(schema.jokes.id, id), ne(schema.jokes.status, 'archived')),
        )
        .returning()
      return row ? toDto(row, frontendUrl) : null
    },

    async archive(id: string): Promise<JokeDto | null> {
      const [row] = await db
        .update(schema.jokes)
        .set({
          status: 'archived',
          shareToken: null,
          publishedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.jokes.id, id))
        .returning()
      return row ? toDto(row, frontendUrl) : null
    },

    async publicByToken(token: string): Promise<PublicJokeDto | null> {
      const [row] = await db
        .select()
        .from(schema.jokes)
        .where(
          and(
            eq(schema.jokes.shareToken, token),
            eq(schema.jokes.status, 'published'),
          ),
        )
        .limit(1)
      if (!row?.publishedAt) return null
      return {
        title: row.title,
        setup: row.setup,
        punchline: row.punchline,
        tags: row.tags,
        publishedAt: row.publishedAt.toISOString(),
      }
    },
  }
}
