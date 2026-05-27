// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Bryntum has no bundled type declarations
import { AjaxHelper, AjaxStore, GridRowModel } from '@bryntum/grid'
import { watch } from 'vue'
import { useQueryClient, type QueryClient } from '@tanstack/vue-query'
import type { Settings } from '../types'
import { DUMMYJSON_SELECT, type RawUser, transformUser } from './useUsersQuery'

export const PAGE_SIZE = 25

// When virtual scroll is active we load everything in one request.
// dummyjson has 208 users; 500 is safely above that.
const VIRTUAL_LIMIT = 500

// Maps every canonical User field to the dummyjson sortBy path.
// dummyjson supports dot-notation for nested fields (e.g. company.title).
const SORT_FIELD_MAP: Record<string, string> = {
  id:         'id',
  name:       'firstName',           // no combined name field in dummyjson
  age:        'age',
  email:      'email',
  role:       'role',
  department: 'company.department',
  title:      'company.title',
  company:    'company.name',
  country:    'address.country',
  state:      'address.state',
}

let mockRegistered     = false
let treeMockRegistered = false
let queryClient: QueryClient | null = null

type PageResponse = { responseText: string }

async function fetchPage(params: Record<string, string>): Promise<PageResponse> {
  const page     = parseInt(params['page']     ?? '1',              10)
  const pageSize = parseInt(params['pageSize'] ?? String(PAGE_SIZE), 10)
  const skip     = (page - 1) * pageSize

  const urlParams = new URLSearchParams({
    limit:  String(pageSize),
    skip:   String(skip),
    select: DUMMYJSON_SELECT,
  })

  let endpoint = 'https://dummyjson.com/users'

  // Filter — dummyjson only supports global q= search, not per-field.
  if (params['filter']) {
    try {
      const filters = JSON.parse(params['filter']) as Array<{ field: string; value: unknown }>
      const term = filters.find(f => f.value !== '' && f.value != null)?.value
      if (term) {
        endpoint = 'https://dummyjson.com/users/search'
        urlParams.set('q', String(term))
      }
    } catch { /* ignore malformed JSON */ }
  }

  // Sort — map our field names to dummyjson's sortBy/order params
  if (params['sort']) {
    try {
      const [{ field, ascending = true }] = JSON.parse(params['sort']) as Array<{
        field: string; ascending?: boolean
      }>
      const dummyField = SORT_FIELD_MAP[field]
      if (dummyField) {
        urlParams.set('sortBy', dummyField)
        urlParams.set('order', ascending ? 'asc' : 'desc')
      }
    } catch { /* ignore malformed JSON */ }
  }

  const res = await fetch(`${endpoint}?${urlParams}`)
  if (!res.ok) throw new Error(`dummyjson fetch failed: ${res.status}`)
  const { users, total } = await res.json() as { users: RawUser[]; total: number }

  return {
    responseText: JSON.stringify({
      success: true,
      total,
      data: users.map(transformUser),
    }),
  }
}

// Register the AjaxHelper mock once. Each unique combination of page/pageSize/
// sort/filter gets its own TanStack Query cache entry — back-navigation and
// repeated requests are served from cache without hitting the network.
function registerMock(): void {
  if (mockRegistered) return
  mockRegistered = true

  AjaxHelper.mockUrl('/bryntum-data', (_url: string, params: Record<string, string>) => {
    const qc = queryClient!
    const { page, pageSize, sort = null, filter = null } = params
    return qc.fetchQuery({
      queryKey:  ['bryntum-page', { page, pageSize, sort, filter }],
      queryFn:   () => fetchPage(params),
      staleTime: 2 * 60 * 1000,
    })
  })
}

/**
 * Creates an AjaxStore that fetches directly from dummyjson.com.
 * Bryntum's pagination/sort/filter params are translated to dummyjson's API.
 * Each unique request is cached via TanStack Query so repeated or back-navigation
 * requests are served instantly from cache.
 */
export function useBryntumStore(getSettings: () => Settings) {
  queryClient = useQueryClient()
  registerMock()

  const store = new AjaxStore({
    modelClass:      GridRowModel,
    readUrl:         '/bryntum-data',
    pageParamName:   'page',
    sortParamName:   'sort',
    filterParamName: 'filter',
    pageSize:        PAGE_SIZE,
    autoLoad:        false,
  })

  async function reload(): Promise<void> {
    store.pageSize = getSettings().scrollMode === 'paginate' ? PAGE_SIZE : VIRTUAL_LIMIT
    await store.loadPage(1, {})
  }

  watch(() => getSettings().scrollMode, reload, { immediate: true })

  return { store }
}

// ─── Tree store (User → Post → Comment, lazy-loaded on expand) ───────────────

interface RawTreeUser    { id: number; firstName: string; lastName: string; age: number; email: string; role: string }
interface RawTreePost    { id: number; title: string; views: number; reactions: { likes: number } }
interface RawTreeComment { id: number; body: string; likes: number; user: { fullName: string } }

function registerTreeMock(): void {
  if (treeMockRegistered) return
  treeMockRegistered = true

  AjaxHelper.mockUrl('/bryntum-tree', (_url: string, params: Record<string, string>) => {
    const qc       = queryClient!
    const parentId = params['parentId']

    // Root load — return all users with lazy children
    if (!parentId) {
      return qc.fetchQuery({
        queryKey:  ['tree-users'],
        queryFn:   async () => {
          const res = await fetch('https://dummyjson.com/users?limit=0&select=id,firstName,lastName,age,email,role')
          if (!res.ok) throw new Error(`dummyjson users fetch failed: ${res.status}`)
          const { users } = await res.json() as { users: RawTreeUser[] }
          return {
            responseText: JSON.stringify({
              success: true,
              data: users.map(u => ({
                id:       `user-${u.id}`,
                nodeType: 'user',
                srcId:    u.id,
                name:     `${u.firstName} ${u.lastName}`,
                info:     u.role,
                detail:   u.email,
                numeric:  u.age,
                children: true,
              })),
            }),
          }
        },
        staleTime: 5 * 60 * 1000,
      })
    }

    // User children — lazy-load that user's posts
    if (parentId.startsWith('user-')) {
      const userId = parentId.slice(5)
      return qc.fetchQuery({
        queryKey:  ['tree-posts', userId],
        queryFn:   async () => {
          const res = await fetch(`https://dummyjson.com/users/${userId}/posts?select=id,title,views,reactions`)
          if (!res.ok) throw new Error(`dummyjson posts fetch failed: ${res.status}`)
          const { posts } = await res.json() as { posts: RawTreePost[] }
          return {
            responseText: JSON.stringify({
              success: true,
              data: posts.map(p => ({
                id:       `post-${p.id}`,
                nodeType: 'post',
                srcId:    p.id,
                name:     p.title,
                info:     `${p.reactions?.likes ?? 0} 👍`,
                detail:   `${p.views} views`,
                numeric:  p.views,
                children: true,
              })),
            }),
          }
        },
        staleTime: 5 * 60 * 1000,
      })
    }

    // Post children — lazy-load that post's comments
    if (parentId.startsWith('post-')) {
      const postId = parentId.slice(5)
      return qc.fetchQuery({
        queryKey:  ['tree-comments', postId],
        queryFn:   async () => {
          const res = await fetch(`https://dummyjson.com/posts/${postId}/comments?limit=20`)
          if (!res.ok) throw new Error(`dummyjson comments fetch failed: ${res.status}`)
          const { comments } = await res.json() as { comments: RawTreeComment[] }
          return {
            responseText: JSON.stringify({
              success: true,
              data: comments.map(c => ({
                id:       `comment-${c.id}`,
                nodeType: 'comment',
                srcId:    c.id,
                name:     c.body,
                info:     c.user?.fullName ?? '',
                detail:   `${c.likes} 👍`,
                numeric:  c.likes,
                // no children — leaf node
              })),
            }),
          }
        },
        staleTime: 5 * 60 * 1000,
      })
    }

    return Promise.resolve({ responseText: JSON.stringify({ success: true, data: [] }) })
  })
}

/**
 * Creates an AjaxStore in tree mode for lazy User → Post → Comment navigation.
 * Each node level is fetched on demand and cached via TanStack Query.
 * Must be called inside a Vue component setup() that already has a QueryClient.
 */
export function useBryntumTreeStore() {
  queryClient = useQueryClient()
  registerTreeMock()

  const store = new AjaxStore({
    tree:       true,
    modelClass: GridRowModel,
    readUrl:    '/bryntum-tree',
    autoLoad:   true,
  })

  return { store }
}
