import type { JokeStatus } from '@punchline-hq/api-client'
import { Badge } from '@punchline-hq/ui/components/badge'
import { Card, CardContent } from '@punchline-hq/ui/components/card'
import { Input } from '@punchline-hq/ui/components/input'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowUpRight,
  FileText,
  Plus,
  Search,
  Share2,
} from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { StatePanel } from '../components/StatePanel'
import { StatusBadge } from '../components/StatusBadge'
import { useApi } from '../lib/api'

const filters: Array<'all' | JokeStatus> = [
  'all',
  'draft',
  'published',
  'archived',
]

export function DashboardPage() {
  const api = useApi()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<(typeof filters)[number]>('all')
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
  })
  const jokes = useQuery({ queryKey: ['jokes'], queryFn: api.jokes })

  if (dashboard.isLoading || jokes.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <StatePanel kind="loading" title="Loading the joke portfolio…" />
      </main>
    )
  }
  if (dashboard.isError || jokes.isError || !dashboard.data || !jokes.data) {
    const error = dashboard.error ?? jokes.error
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <StatePanel
          kind="error"
          title="The joke pipeline is unavailable"
          detail={error?.message}
        />
      </main>
    )
  }

  const visibleJokes = jokes.data.filter((joke) => {
    const matchesStatus = filter === 'all' || joke.status === filter
    const haystack =
      `${joke.title} ${joke.setup} ${joke.punchline} ${joke.tags.join(' ')}`.toLowerCase()
    return matchesStatus && haystack.includes(deferredSearch)
  })
  const metrics = [
    { label: 'Total jokes', value: dashboard.data.total, icon: FileText },
    { label: 'Drafts', value: dashboard.data.draft, icon: FileText },
    { label: 'Published', value: dashboard.data.published, icon: Share2 },
    { label: 'Archived', value: dashboard.data.archived, icon: Archive },
  ]

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-violet-200 bg-violet-50 text-violet-700">
            Organization workspace
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Joke portfolio
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Draft together, publish deliberately, and revoke without opening a
            ticket with comedy infrastructure.
          </p>
        </div>
        <Link
          to="/jokes/new"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
        >
          <Plus className="mr-2 h-4 w-4" /> New joke
        </Link>
      </div>

      <section
        className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Joke metrics"
      >
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-200"
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {value}
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Library</h2>
            <p className="mt-1 text-sm text-slate-500">
              {visibleJokes.length} jokes match this view
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                aria-label="Search jokes"
                placeholder="Search jokes"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg pl-9 sm:w-64"
              />
            </div>
            <select
              aria-label="Filter jokes by status"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as (typeof filters)[number])
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-violet-100"
            >
              {filters.map((value) => (
                <option key={value} value={value}>
                  {value === 'all' ? 'All statuses' : value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visibleJokes.length === 0 ? (
          <div className="mt-6">
            <StatePanel
              kind="empty"
              title={
                jokes.data.length === 0
                  ? 'No jokes yet'
                  : 'No jokes match this view'
              }
              detail="Create a new draft or adjust the search and status filters."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleJokes.map((joke) => (
              <Link
                key={joke.id}
                to="/jokes/$jokeId"
                params={{ jokeId: joke.id }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <StatusBadge status={joke.status} />
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-violet-600" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {joke.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {joke.setup}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {joke.tags.length > 0 ? (
                    joke.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)
                  ) : (
                    <span className="text-xs text-slate-400">No tags</span>
                  )}
                </div>
                <p className="mt-5 text-xs text-slate-400">
                  Updated {new Date(joke.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
