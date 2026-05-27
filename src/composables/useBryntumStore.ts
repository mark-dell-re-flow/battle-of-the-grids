import { watch } from 'vue'
import type { Ref } from 'vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Bryntum has no bundled type declarations
import { AjaxHelper, AjaxStore, GridRowModel } from '@bryntum/grid'
import type { User, Settings } from '../types'

export const PAGE_SIZE = 25

// Register the mock URL once at module level so Hot Module Replacement
// doesn't re-register it on every component remount.
let mockRegistered = false

function registerMock(getData: () => User[]): void {
  if (mockRegistered) return
  mockRegistered = true

  AjaxHelper.mockUrl('/bryntum-data', (_url: string, params: Record<string, string>) => {
    let rows = getData().slice()

    // Filter
    if (params['filter']) {
      try {
        const filters = JSON.parse(params['filter']) as Array<{
          field: string; value: unknown; operator?: string
        }>
        for (const { field, value, operator = 'contains' } of filters) {
          if (value === null || value === undefined || value === '') continue
          rows = rows.filter(row => {
            const cell = row[field as keyof User]
            if (cell == null) return false
            const s  = String(cell).toLowerCase()
            const v  = String(value).toLowerCase()
            switch (operator.toLowerCase()) {
              case '=':  case 'eq':  return s === v
              case '!=': case 'ne':  return s !== v
              case '>':  case 'gt':  return Number(cell) > Number(value)
              case '>=': case 'gte': return Number(cell) >= Number(value)
              case '<':  case 'lt':  return Number(cell) < Number(value)
              case '<=': case 'lte': return Number(cell) <= Number(value)
              case 'startswith':     return s.startsWith(v)
              case 'endswith':       return s.endsWith(v)
              default:               return s.includes(v)
            }
          })
        }
      } catch { /* ignore malformed filter JSON */ }
    }

    // Sort
    if (params['sort']) {
      try {
        const [{ field, ascending = true }] = JSON.parse(params['sort']) as Array<{
          field: string; ascending?: boolean
        }>
        rows.sort((a, b) => {
          const av = a[field as keyof User] ?? ''
          const bv = b[field as keyof User] ?? ''
          const cmp = av < bv ? -1 : av > bv ? 1 : 0
          return ascending ? cmp : -cmp
        })
      } catch { /* ignore malformed sort JSON */ }
    }

    const page     = parseInt(params['page'] ?? '1', 10)
    const pageSize = parseInt(params['pageSize'] ?? String(PAGE_SIZE), 10)
    const start    = (page - 1) * pageSize

    return {
      responseText: JSON.stringify({
        success: true,
        total:   rows.length,
        data:    rows.slice(start, start + pageSize),
      }),
    }
  })
}

/**
 * Creates an AjaxStore backed by local data via AjaxHelper.mockUrl.
 * Supports pagination, sort and filter transparently — the PagingToolbar
 * works as if talking to a real server.
 */
export function useBryntumStore(data: Ref<User[] | undefined>, getSettings: () => Settings) {
  registerMock(() => data.value ?? [])

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
    if (!data.value) return
    store.pageSize = getSettings().scrollMode === 'paginate' ? PAGE_SIZE : data.value.length
    await store.loadPage(1, {})
  }

  // Load once the TanStack Query data arrives
  watch(data, reload, { immediate: true })

  // Reload when the user switches scroll mode
  watch(() => getSettings().scrollMode, reload)

  return { store }
}
