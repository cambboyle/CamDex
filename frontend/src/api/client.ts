import { supabase } from '@/lib/supabase'

const BASE_URL = '/api'

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(res.status, body.message ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
