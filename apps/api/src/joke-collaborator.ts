import { randomUUID } from 'node:crypto'
import {
  type JokeCollaboratorContext,
  type JokeCollaboratorResponse,
  jokeCollaboratorResponseSchema,
} from '@punchline-hq/contracts'
import {
  chat,
  EventType,
  type ModelMessage,
  type StreamChunk,
  type UIMessage,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import {
  createVercelGatewayText,
  vercelGatewayText,
} from '@tanstack/ai-vercel-gateway'

const openaiModel = 'gpt-5.6-luna' as const
const vercelGatewayModel = 'openai/gpt-5.6-luna' as const

type CollaboratorMessages = Array<UIMessage | ModelMessage>

function textFromMessage(message: UIMessage | ModelMessage): string {
  if ('parts' in message && Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => ('content' in part ? part.content : ''))
      .join(' ')
  }
  return 'content' in message && typeof message.content === 'string'
    ? message.content
    : ''
}

function latestUserText(messages: CollaboratorMessages): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message?.role === 'user') return textFromMessage(message).trim()
  }
  return ''
}

function shortTopic(input: string): string {
  const cleaned = input
    .replace(/[^a-zA-Z0-9 '-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.split(' ').slice(0, 8).join(' ') || 'quarterly planning'
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 120)
}

function mockResponse(
  context: JokeCollaboratorContext,
  messages: CollaboratorMessages,
): JokeCollaboratorResponse {
  const draft = context.currentDraft
  const userText = latestUserText(messages)
  const topic = shortTopic(
    userText === 'Give me a fresh workplace joke idea.'
      ? draft.title || draft.setup || 'quarterly planning'
      : userText,
  )

  switch (context.intent) {
    case 'brainstorm':
      return {
        reply:
          'Here is a clean workplace angle with a setup that leaves room for the turn.',
        suggestion: {
          title: titleCase(`${topic} miscommunication`),
          setup: `Why did the ${topic} meeting bring a compass?`,
          punchline: 'Because everyone kept asking for more direction.',
          tags: ['workplace', 'meetings'],
        },
      }
    case 'sharpen-setup':
      return {
        reply:
          'I tightened the premise and moved the important image to the end of the setup.',
        suggestion: {
          setup: draft.setup
            ? `${draft.setup.replace(/[?.!]+$/, '')}—and why was it carrying a compass?`
            : `Why did the ${topic} meeting bring a compass?`,
        },
      }
    case 'punch-up':
      return {
        reply:
          'This version lands faster and echoes the language of the setup.',
        suggestion: {
          punchline: draft.setup.toLowerCase().includes('roadmap')
            ? 'It was the only way to turn “next quarter” into an actual direction.'
            : 'Because “circle back” was starting to feel geographically accurate.',
        },
      }
    case 'alternate-angle':
      return {
        reply:
          'Here is a different angle that keeps the workplace voice but changes the mechanism.',
        suggestion: {
          title: draft.title || titleCase(`${topic} alignment`),
          setup: `Our ${topic} session was so focused on alignment, it installed turn signals.`,
          punchline: 'Unfortunately, every department was still turning left.',
        },
      }
    case 'suggest-tags':
      return {
        reply:
          'These tags describe the premise without giving away the punchline.',
        suggestion: {
          tags: Array.from(
            new Set([
              ...draft.tags,
              'workplace',
              draft.setup.toLowerCase().includes('meeting')
                ? 'meetings'
                : 'teamwork',
            ]),
          ).slice(0, 8),
        },
      }
    case 'critique':
      return {
        reply:
          draft.setup && draft.punchline
            ? 'The premise is clear. The strongest next move is to shorten the punchline and reuse one concrete word from the setup so the turn feels earned.'
            : 'Start with one concrete workplace image in the setup, then make the punchline reinterpret that same image. Fill both fields and I can give more specific notes.',
        suggestion: null,
      }
    case 'freeform':
      return draft.setup || draft.punchline
        ? {
            reply:
              'I treated that as a request for a tighter alternate while preserving your premise.',
            suggestion: {
              punchline:
                draft.punchline ||
                'Because the action items needed a better opening act.',
            },
          }
        : {
            reply:
              'I turned your note into a complete first draft that you can shape from here.',
            suggestion: {
              title: titleCase(`${topic} joke`),
              setup: `Why did the team invite ${topic} to the all-hands?`,
              punchline:
                'It was the only topic with enough material for every slide.',
              tags: ['workplace', 'teamwork'],
            },
          }
  }
}

async function* createMockStream({
  context,
  messages,
  threadId,
  runId,
}: {
  context: JokeCollaboratorContext
  messages: CollaboratorMessages
  threadId: string
  runId: string
}): AsyncGenerator<StreamChunk> {
  const messageId = randomUUID()
  const response = jokeCollaboratorResponseSchema.parse(
    mockResponse(context, messages),
  )
  const raw = JSON.stringify(response)
  const chunkSize = Math.max(1, Math.ceil(raw.length / 4))
  const timestamp = Date.now()

  yield { type: EventType.RUN_STARTED, threadId, runId, timestamp }
  yield {
    type: 'CUSTOM',
    name: 'structured-output.start',
    value: { messageId },
    timestamp,
  }
  yield {
    type: EventType.TEXT_MESSAGE_START,
    messageId,
    role: 'assistant',
    timestamp,
  }
  for (let index = 0; index < raw.length; index += chunkSize) {
    yield {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId,
      delta: raw.slice(index, index + chunkSize),
      timestamp: Date.now(),
    }
    await Promise.resolve()
  }
  yield {
    type: EventType.TEXT_MESSAGE_END,
    messageId,
    timestamp: Date.now(),
  }
  yield {
    type: 'CUSTOM',
    name: 'structured-output.complete',
    value: { object: response, raw, messageId },
    timestamp: Date.now(),
  }
  yield {
    type: EventType.RUN_FINISHED,
    threadId,
    runId,
    timestamp: Date.now(),
    result: response,
  }
}

function systemPrompt(context: JokeCollaboratorContext): string {
  return [
    "You are Punchline HQ's collaborative joke editor for workplace teams.",
    'Be concise, constructive, and playful. Avoid hateful, sexual, violent, or targeted material.',
    'Return one helpful reply and, only when useful, a partial structured suggestion.',
    'Never claim that you saved, published, or changed the joke.',
    `Requested intent: ${context.intent}.`,
    `Current unsaved draft: ${JSON.stringify(context.currentDraft)}.`,
  ].join('\n')
}

export function createJokeCollaboratorStream({
  provider,
  context,
  messages,
  threadId,
  runId,
  abortController,
  vercelGatewayToken,
}: {
  provider: 'mock' | 'openai' | 'vercel-gateway'
  context: JokeCollaboratorContext
  messages: CollaboratorMessages
  threadId: string
  runId: string
  abortController: AbortController
  vercelGatewayToken?: string | undefined
}): AsyncIterable<StreamChunk> {
  if (provider === 'mock') {
    return createMockStream({ context, messages, threadId, runId })
  }

  return chat({
    adapter:
      provider === 'vercel-gateway'
        ? vercelGatewayToken
          ? createVercelGatewayText(vercelGatewayModel, vercelGatewayToken)
          : vercelGatewayText(vercelGatewayModel)
        : openaiText(openaiModel),
    messages,
    systemPrompts: [systemPrompt(context)],
    outputSchema: jokeCollaboratorResponseSchema,
    stream: true,
    threadId,
    runId,
    abortController,
  })
}
