import { useQuery } from '@tanstack/vue-query'
import type { User } from '../types'

const SELECT = 'id,firstName,lastName,age,email,role,company,address'

async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`https://dummyjson.com/users?limit=0&select=${SELECT}`)
  if (!res.ok) throw new Error(`dummyjson fetch failed: ${res.status}`)
  const { users } = await res.json() as { users: Record<string, unknown>[] }

  return users.map(u => ({
    id:         u['id']         as number,
    name:       `${u['firstName']} ${u['lastName']}`,
    department: (u['company'] as Record<string, unknown>)?.['department'] as string ?? '',
    title:      (u['company'] as Record<string, unknown>)?.['title']      as string ?? '',
    company:    (u['company'] as Record<string, unknown>)?.['name']       as string ?? '',
    role:       u['role']       as string ?? '',
    country:    (u['address']  as Record<string, unknown>)?.['country']   as string ?? '',
    state:      (u['address']  as Record<string, unknown>)?.['state']     as string ?? '',
    age:        u['age']        as number,
    email:      u['email']      as string ?? '',
  }))
}

export function useUsersQuery() {
  return useQuery<User[]>({
    queryKey:  ['users'],
    queryFn:   fetchUsers,
    staleTime: 5 * 60 * 1000,
  })
}
