import { useQuery } from '@tanstack/vue-query'
import type { User } from '../types'

// Fields we need from dummyjson — used by both this query and useBryntumStore
export const DUMMYJSON_SELECT = 'id,firstName,lastName,age,email,role,company,address'

// Raw shape returned by dummyjson before transformation
export interface RawUser {
  id:         number
  firstName:  string
  lastName:   string
  age:        number
  email:      string
  role:       string
  company:    { department: string; title: string; name: string }
  address:    { country: string; state: string }
}

// Transform a raw dummyjson user into our canonical User shape.
// Exported so useBryntumStore can reuse the same transform on server responses.
export function transformUser(u: RawUser): User {
  return {
    id:         u.id,
    name:       `${u.firstName} ${u.lastName}`,
    department: u.company?.department ?? '',
    title:      u.company?.title      ?? '',
    company:    u.company?.name       ?? '',
    role:       u.role                ?? '',
    country:    u.address?.country    ?? '',
    state:      u.address?.state      ?? '',
    age:        u.age,
    email:      u.email               ?? '',
  }
}

async function fetchAllUsers(): Promise<RawUser[]> {
  const res = await fetch(
    `https://dummyjson.com/users?limit=0&select=${DUMMYJSON_SELECT}`
  )
  if (!res.ok) throw new Error(`dummyjson fetch failed: ${res.status}`)
  const { users } = await res.json() as { users: RawUser[] }
  return users
}

// Fetches all 208 users once; TanStack Query caches the raw response and
// applies `select` to transform it. AG Grid uses this for client-side ops.
export function useUsersQuery() {
  return useQuery<RawUser[], Error, User[]>({
    queryKey:  ['users'],
    queryFn:   fetchAllUsers,
    select:    users => users.map(transformUser),
    staleTime: 5 * 60 * 1000,
  })
}
