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

let mockRegistered = false
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
