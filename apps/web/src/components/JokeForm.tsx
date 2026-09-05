import type { CreateJokeInput } from '@punchline-hq/api-client'
import { Button } from '@punchline-hq/ui/components/button'
import { Card, CardContent } from '@punchline-hq/ui/components/card'
import { Input } from '@punchline-hq/ui/components/input'
import { Textarea } from '@punchline-hq/ui/components/textarea'
import { Save } from 'lucide-react'
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

export function JokeForm({
  value,
  onChange,
  collaborator,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  value: CreateJokeInput
  onChange: (value: CreateJokeInput) => void
  collaborator: ReactNode
  submitLabel: string
  pending: boolean
  error?: string | undefined
  onSubmit: (input: CreateJokeInput) => void
}) {
  const serializedTags = value.tags.join(', ')
  const [tagsText, setTagsText] = useState(serializedTags)
  const lastTagsValue = useRef(serializedTags)

  useEffect(() => {
    if (serializedTags === lastTagsValue.current) return
    lastTagsValue.current = serializedTags
    setTagsText(serializedTags)
  }, [serializedTags])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(value)
  }

  const setField = <K extends keyof CreateJokeInput>(
    field: K,
    fieldValue: CreateJokeInput[K],
  ) => onChange({ ...value, [field]: fieldValue })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.86fr] lg:items-start">
      <Card className="order-2 rounded-2xl border-0 shadow-sm ring-1 ring-slate-200 lg:order-1">
        <form onSubmit={submit}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div>
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-800"
              >
                Internal title
              </label>
              <p className="mb-2 mt-1 text-sm text-slate-500">
                Give your team something easy to find later.
              </p>
              <Input
                id="title"
                required
                maxLength={120}
                placeholder="The quarterly alignment joke"
                value={value.title}
                onChange={(event) => setField('title', event.target.value)}
                className="h-12 rounded-lg focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
            <div>
              <label
                htmlFor="setup"
                className="text-sm font-semibold text-slate-800"
              >
                Setup
              </label>
              <p className="mb-2 mt-1 text-sm text-slate-500">
                Establish the premise without giving away the turn.
              </p>
              <Textarea
                id="setup"
                required
                maxLength={500}
                placeholder="Why did the roadmap attend the all-hands?"
                value={value.setup}
                onChange={(event) => setField('setup', event.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="punchline"
                className="text-sm font-semibold text-slate-800"
              >
                Punchline
              </label>
              <p className="mb-2 mt-1 text-sm text-slate-500">
                Deliver the twist. Legal can review it later.
              </p>
              <Textarea
                id="punchline"
                required
                maxLength={500}
                placeholder="It needed more alignment."
                value={value.punchline}
                onChange={(event) => setField('punchline', event.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="tags"
                className="text-sm font-semibold text-slate-800"
              >
                Tags
              </label>
              <p className="mb-2 mt-1 text-sm text-slate-500">
                Up to eight comma-separated tags.
              </p>
              <Input
                id="tags"
                placeholder="workplace, strategy"
                value={tagsText}
                onChange={(event) => {
                  const nextTagsText = event.target.value
                  const nextTags = nextTagsText
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                  setTagsText(nextTagsText)
                  lastTagsValue.current = nextTags.join(', ')
                  setField('tags', nextTags)
                }}
                className="h-12 rounded-lg focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}
            <Button className="w-full sm:w-auto" size="lg" disabled={pending}>
              <Save className="mr-2 h-4 w-4" />
              {pending ? 'Saving…' : submitLabel}
            </Button>
          </CardContent>
        </form>
      </Card>

      <aside className="order-1 space-y-7 lg:sticky lg:top-28 lg:order-2 lg:self-start">
        {collaborator}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Live preview
          </p>
          <div className="overflow-hidden rounded-3xl bg-slate-950 p-1 shadow-2xl shadow-violet-200/60">
            <div className="rounded-[1.35rem] bg-gradient-to-br from-violet-600 to-fuchsia-500 p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
                {value.title || 'Untitled joke'}
              </p>
              <p className="mt-8 text-xl font-medium leading-8">
                {value.setup || 'Your setup will appear here.'}
              </p>
              <div className="my-7 h-px bg-white/30" />
              <p className="text-2xl font-bold leading-9">
                {value.punchline || 'And the punchline lands here.'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Drafts stay private to the organization until someone publishes an
            unlisted link.
          </p>
        </div>
      </aside>
    </div>
  )
}
