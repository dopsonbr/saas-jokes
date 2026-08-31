import type { CreateJokeInput } from '@punchline-hq/api-client'
import { Button } from '@punchline-hq/ui/components/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Archive,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Share2,
  Unlink,
} from 'lucide-react'
import { useState } from 'react'
import { JokeForm } from '../components/JokeForm'
import { StatePanel } from '../components/StatePanel'
import { StatusBadge } from '../components/StatusBadge'
import { useApi } from '../lib/api'

function EditorHeader({
  title,
  status,
}: {
  title: string
  status?: 'draft' | 'published' | 'archived'
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {status ? <StatusBadge status={status} /> : null}
        </div>
      </div>
    </div>
  )
}

export function NewJokePage() {
  const api = useApi()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: api.createJoke,
    onSuccess: async (joke) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['jokes'] }),
      ])
      await navigate({ to: '/jokes/$jokeId', params: { jokeId: joke.id } })
    },
  })

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <EditorHeader title="Build a new joke" />
      <JokeForm
        submitLabel="Save draft"
        pending={create.isPending}
        error={create.error?.message}
        onSubmit={(input) => create.mutate(input)}
      />
    </main>
  )
}

export function EditJokePage() {
  const { jokeId } = useParams({ from: '/workspace/jokes/$jokeId' })
  const api = useApi()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const jokeQuery = useQuery({
    queryKey: ['joke', jokeId],
    queryFn: () => api.joke(jokeId),
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['joke', jokeId] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['jokes'] }),
    ])
  }
  const update = useMutation({
    mutationFn: (input: CreateJokeInput) => api.updateJoke(jokeId, input),
    onSuccess: refresh,
  })
  const share = useMutation({
    mutationFn: () => api.shareJoke(jokeId),
    onSuccess: refresh,
  })
  const revoke = useMutation({
    mutationFn: () => api.revokeShare(jokeId),
    onSuccess: refresh,
  })
  const archive = useMutation({
    mutationFn: () => api.archiveJoke(jokeId),
    onSuccess: async () => {
      await refresh()
      await navigate({ to: '/' })
    },
  })

  if (jokeQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <StatePanel kind="loading" title="Loading joke…" />
      </main>
    )
  }
  if (jokeQuery.isError || !jokeQuery.data) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <StatePanel
          kind="error"
          title="Joke unavailable"
          detail={jokeQuery.error?.message}
        />
      </main>
    )
  }
  const joke = jokeQuery.data
  const actionError =
    update.error ?? share.error ?? revoke.error ?? archive.error

  const copyShareLink = async () => {
    if (!joke.shareUrl) return
    await navigator.clipboard.writeText(joke.shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const archiveJoke = () => {
    if (window.confirm('Archive this joke? Any public link will stop working.'))
      archive.mutate()
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <EditorHeader title={joke.title} status={joke.status} />
      <div className="mb-7 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {joke.status === 'published' && joke.shareUrl ? (
          <>
            <Button type="button" variant="outline" onClick={copyShareLink}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <a
              href={joke.shareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Open public page
            </a>
            <Button
              type="button"
              variant="ghost"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate()}
            >
              <Unlink className="mr-2 h-4 w-4" /> Revoke link
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={share.isPending || joke.status === 'archived'}
            onClick={() => share.mutate()}
          >
            <Share2 className="mr-2 h-4 w-4" />{' '}
            {share.isPending ? 'Publishing…' : 'Publish share link'}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          className="sm:ml-auto"
          disabled={archive.isPending}
          onClick={archiveJoke}
        >
          <Archive className="mr-2 h-4 w-4" /> Archive
        </Button>
      </div>
      {actionError ? (
        <p
          role="alert"
          className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError.message}
        </p>
      ) : null}
      <JokeForm
        initialValue={{
          title: joke.title,
          setup: joke.setup,
          punchline: joke.punchline,
          tags: joke.tags,
        }}
        submitLabel="Save changes"
        pending={update.isPending}
        error={update.error?.message}
        onSubmit={(input) => update.mutate(input)}
      />
    </main>
  )
}
