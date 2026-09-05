import type {
  CreateJokeInput,
  DashboardDto,
  JokeDto,
  PublicJokeDto,
  ShareJokeResult,
  UpdateJokeInput,
} from '@punchline-hq/contracts'

export type {
  CreateJokeInput,
  JokeCollaboratorContext,
  JokeCollaboratorIntent,
  JokeCollaboratorResponse,
  JokeDraft,
  JokeDto,
  JokeStatus,
  JokeSuggestion,
  PublicJokeDto,
  UpdateJokeInput,
} from '@punchline-hq/contracts'
export { jokeCollaboratorResponseSchema } from '@punchline-hq/contracts'

export type TokenProvider = () => Promise<string | null>

export function createApiClient(baseUrl: string, getToken: TokenProvider) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      throw new Error(body?.error ?? `API request failed (${response.status})`)
    }
    return response.json() as Promise<T>
  }

  async function publicRequest<T>(path: string): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`)
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? 'This share link is unavailable.'
          : 'Unable to load joke.',
      )
    }
    return response.json() as Promise<T>
  }

  return {
    dashboard: () => request<DashboardDto>('/v1/dashboard'),
    jokes: () => request<JokeDto[]>('/v1/jokes'),
    joke: (id: string) => request<JokeDto>(`/v1/jokes/${id}`),
    createJoke: (input: CreateJokeInput) =>
      request<JokeDto>('/v1/jokes', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    updateJoke: (id: string, input: UpdateJokeInput) =>
      request<JokeDto>(`/v1/jokes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    shareJoke: (id: string) =>
      request<ShareJokeResult>(`/v1/jokes/${id}/share`, {
        method: 'POST',
      }),
    revokeShare: (id: string) =>
      request<JokeDto>(`/v1/jokes/${id}/share`, { method: 'DELETE' }),
    archiveJoke: (id: string) =>
      request<JokeDto>(`/v1/jokes/${id}/archive`, { method: 'POST' }),
    publicJoke: (token: string) =>
      publicRequest<PublicJokeDto>(`/public/v1/jokes/${token}`),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
