import {
  chatParamsFromRequestBody,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { createJokeCollaboratorStream } from './joke-collaborator.js'

const params = await chatParamsFromRequestBody({
  threadId: 'live-ai-smoke-thread',
  runId: `live-ai-smoke-${Date.now()}`,
  state: {},
  messages: [
    {
      id: 'live-ai-smoke-message',
      role: 'user',
      content: 'Create a clean new-dad workplace joke.',
    },
  ],
  tools: [],
  context: [],
  forwardedProps: {},
})
const abortController = new AbortController()
const stream = createJokeCollaboratorStream({
  provider: 'vercel-gateway',
  context: {
    intent: 'brainstorm',
    currentDraft: { title: '', setup: '', punchline: '', tags: [] },
  },
  messages: params.messages,
  threadId: params.threadId,
  runId: params.runId,
  abortController,
})
const response = toServerSentEventsResponse(stream, { abortController })
const events = await response.text()

if (events.includes('RUN_ERROR')) {
  throw new Error(`Live AI stream failed: ${events.slice(0, 500)}`)
}
if (!events.includes('structured-output.complete')) {
  throw new Error('Live AI stream ended without structured output')
}

console.log('Live AI smoke test passed: openai/gpt-5.6-luna')
