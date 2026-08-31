import 'dotenv/config'
import { createDb } from './index'
import { jokes } from './schema'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

const db = createDb(process.env.DATABASE_URL)
await db.insert(jokes).values([
  {
    title: 'The alignment meeting',
    setup: 'Why did the roadmap attend the all-hands?',
    punchline: 'It needed more alignment.',
    tags: ['workplace', 'strategy'],
    createdByUserId: 'seed',
  },
  {
    title: 'Cloud migration',
    setup: 'Why did the server move to the cloud?',
    punchline: 'It needed some space to scale emotionally.',
    tags: ['technology'],
    createdByUserId: 'seed',
  },
  {
    title: 'Quarterly forecast',
    setup: 'Our forecast said the joke pipeline was healthy.',
    punchline: 'Then legal asked to review the punchline.',
    tags: ['finance', 'legal'],
    createdByUserId: 'seed',
  },
])

console.log('Seed complete')
