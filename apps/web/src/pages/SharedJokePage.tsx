import { Badge } from '@punchline-hq/ui/components/badge'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Laugh, ShieldCheck } from 'lucide-react'
import { StatePanel } from '../components/StatePanel'
import { publicApi } from '../lib/api'

export function SharedJokePage() {
  const { shareToken } = useParams({ from: '/share/$shareToken' })
  const joke = useQuery({
    queryKey: ['public-joke', shareToken],
    queryFn: () => publicApi.publicJoke(shareToken),
  })

  if (joke.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6">
        <div className="w-full max-w-2xl">
          <StatePanel kind="loading" title="Loading punchline…" />
        </div>
      </main>
    )
  }
  if (joke.isError || !joke.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6">
        <div className="w-full max-w-2xl">
          <StatePanel
            kind="error"
            title="This punchline has left the building"
            detail={joke.error?.message ?? 'The link may have been revoked.'}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-16 text-white">
      <div className="absolute left-[-10rem] top-[-8rem] h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[-8rem] h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <article className="relative w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600">
              <Laugh className="h-5 w-5" />
            </span>
            Punchline HQ
          </div>
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" /> Unlisted share
          </span>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-500 p-1 shadow-2xl shadow-violet-950">
          <div className="rounded-[1.8rem] bg-white p-8 text-slate-950 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">
              {joke.data.title}
            </p>
            <p className="mt-10 text-2xl font-medium leading-10 sm:text-4xl sm:leading-[1.25]">
              {joke.data.setup}
            </p>
            <div className="my-9 h-px bg-slate-200" />
            <p className="text-3xl font-black leading-tight text-violet-700 sm:text-5xl">
              {joke.data.punchline}
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {joke.data.tags.map((tag) => (
                <Badge key={tag}>#{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Published {new Date(joke.data.publishedAt).toLocaleDateString()} ·
          Managed with revocable sharing
        </p>
      </article>
    </main>
  )
}
