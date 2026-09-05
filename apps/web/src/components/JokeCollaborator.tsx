import {
  type JokeCollaboratorIntent,
  type JokeDraft,
  type JokeSuggestion,
  jokeCollaboratorResponseSchema,
} from '@punchline-hq/api-client'
import { useAuth } from '@punchline-hq/auth/react'
import { Badge } from '@punchline-hq/ui/components/badge'
import { Button } from '@punchline-hq/ui/components/button'
import { Card, CardContent } from '@punchline-hq/ui/components/card'
import { Textarea } from '@punchline-hq/ui/components/textarea'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import {
  Lightbulb,
  MessageCircleMore,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL

const actions: Array<{
  intent: Exclude<JokeCollaboratorIntent, 'freeform'>
  label: string
  prompt: string
}> = [
  {
    intent: 'brainstorm',
    label: 'Brainstorm',
    prompt: 'Give me a fresh workplace joke idea.',
  },
  {
    intent: 'sharpen-setup',
    label: 'Sharpen setup',
    prompt: 'Make this setup clearer and tighter.',
  },
  {
    intent: 'punch-up',
    label: 'Punch it up',
    prompt: 'Give this punchline a stronger turn.',
  },
  {
    intent: 'alternate-angle',
    label: 'Try another angle',
    prompt: 'Explore a different comic angle.',
  },
  {
    intent: 'suggest-tags',
    label: 'Suggest tags',
    prompt: 'Suggest useful tags for this draft.',
  },
  {
    intent: 'critique',
    label: 'Critique',
    prompt: 'Give me concise editorial feedback.',
  },
]

function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: JokeSuggestion
  onApply: (suggestion: JokeSuggestion) => void
}) {
  const fields = Object.entries(suggestion) as Array<
    [keyof JokeSuggestion, string | Array<string>]
  >

  return (
    <div className="mt-3 rounded-xl border border-violet-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
          Suggested edit
        </p>
        <Button type="button" size="sm" onClick={() => onApply(suggestion)}>
          Apply all
        </Button>
      </div>
      <div className="space-y-3">
        {fields.map(([field, fieldValue]) => (
          <div key={field} className="rounded-lg bg-violet-50/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold capitalize text-violet-700">
                  {field}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-700">
                  {Array.isArray(fieldValue)
                    ? fieldValue.map((tag) => `#${tag}`).join(' ')
                    : fieldValue}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => onApply({ [field]: fieldValue })}
              >
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function JokeCollaborator({
  draft,
  onApply,
}: {
  draft: JokeDraft
  onApply: (suggestion: JokeSuggestion) => void
}) {
  const { getToken } = useAuth()
  const [input, setInput] = useState('')
  const [activeIntent, setActiveIntent] =
    useState<JokeCollaboratorIntent>('freeform')
  const connection = useMemo(
    () =>
      fetchServerSentEvents(`${apiUrl}/v1/ai/joke-collaborator`, async () => {
        const token = await getToken()
        if (!token) throw new Error('Authentication required')
        return { headers: { Authorization: `Bearer ${token}` } }
      }),
    [getToken],
  )
  const forwardedProps = useMemo(
    () => ({ intent: activeIntent, currentDraft: draft }),
    [activeIntent, draft],
  )
  const { messages, sendMessage, isLoading, error, stop, reload, clear } =
    useChat({
      connection,
      forwardedProps,
      outputSchema: jokeCollaboratorResponseSchema,
    })

  const send = async (message: string, intent: JokeCollaboratorIntent) => {
    const content = message.trim()
    if (!content || isLoading) return
    setInput('')
    setActiveIntent(intent)
    await sendMessage(content, {
      whenBusy: 'drop',
      body: { intent, currentDraft: draft },
    })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void send(input, 'freeform')
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-violet-200 bg-gradient-to-b from-violet-50 to-white shadow-xl shadow-violet-100/80">
      <div className="border-b border-violet-100 bg-white/80 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
              <WandSparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold tracking-tight">Joke collaborator</h2>
              <p className="text-xs text-slate-500">
                Ideas, edits, and honest notes
              </p>
            </div>
          </div>
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            AI collaborator
          </Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <fieldset className="mb-4 flex flex-wrap gap-2">
          <legend className="sr-only">Collaborator actions</legend>
          {actions.map((action) => (
            <Button
              key={action.intent}
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => void send(action.prompt, action.intent)}
            >
              {action.intent === 'brainstorm' ? (
                <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              {action.label}
            </Button>
          ))}
        </fieldset>

        <div
          className="max-h-[28rem] min-h-48 space-y-4 overflow-y-auto rounded-2xl border border-violet-100 bg-white/80 p-4"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="grid min-h-40 place-items-center text-center">
              <div>
                <MessageCircleMore className="mx-auto h-7 w-7 text-violet-400" />
                <p className="mt-3 font-semibold text-slate-800">
                  Bring me an idea or a rough draft.
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  I’ll suggest changes. You decide what reaches the page.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const hasStructuredOutput = message.parts.some(
                (part) => part.type === 'structured-output',
              )

              return (
                <div
                  key={message.id}
                  className={
                    message.role === 'user'
                      ? 'ml-8 rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm text-white'
                      : 'mr-3 rounded-2xl rounded-bl-md bg-violet-50 px-4 py-3 text-sm text-slate-700'
                  }
                >
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      if (message.role === 'assistant' && hasStructuredOutput) {
                        return null
                      }
                      return <p key={index}>{part.content}</p>
                    }
                    if (part.type === 'structured-output') {
                      const response = part.data ?? part.partial
                      return (
                        <div key={index}>
                          {response?.reply ? (
                            <p className="leading-6">{response.reply}</p>
                          ) : null}
                          {part.status === 'complete' &&
                          part.data?.suggestion ? (
                            <SuggestionCard
                              suggestion={part.data.suggestion}
                              onApply={onApply}
                            />
                          ) : null}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )
            })
          )}
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-violet-700">
              <Sparkles className="h-4 w-4 animate-pulse" /> Collaborating…
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            <p>The collaborator lost the thread. Your draft is unchanged.</p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-1"
              onClick={() => void reload()}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <Textarea
            aria-label="Message the joke collaborator"
            maxLength={2000}
            placeholder="Try: Make this drier, shorter, and safer for an all-hands…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send(input, 'freeform')
              }
            }}
          />
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={messages.length === 0 || isLoading}
              onClick={clear}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear
            </Button>
            {isLoading ? (
              <Button type="button" size="sm" variant="outline" onClick={stop}>
                <Square className="mr-2 h-3.5 w-3.5" /> Stop
              </Button>
            ) : (
              <Button type="submit" size="sm" disabled={!input.trim()}>
                <Send className="mr-2 h-3.5 w-3.5" /> Send
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
