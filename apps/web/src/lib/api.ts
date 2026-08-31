import { createApiClient } from '@punchline-hq/api-client'
import { useAuth } from '@punchline-hq/auth/react'
import { useMemo } from 'react'

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) throw new Error('Missing VITE_API_URL')

export function useApi() {
  const { getToken } = useAuth()
  return useMemo(() => createApiClient(apiUrl, getToken), [getToken])
}

export const publicApi = createApiClient(apiUrl, async () => null)
