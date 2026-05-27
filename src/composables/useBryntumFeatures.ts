import { watch, onMounted, nextTick } from 'vue'
import type { Settings } from '../types'
import { toBryntumColumns, COLUMNS } from './useColumnDefs'

/**
 * Drives Bryntum feature toggles imperatively.
 * Bryntum's Vue prop bindings are not reactive after init — features must be
 * enabled/disabled via the instance API using onMounted + watch.
 *
 * Accepts a getter (() => Settings) rather than a plain value so Vue can
 * correctly track reactivity across the composable boundary.
 */
export function useBryntumFeatures(
  getGrid:     () => Record<string, unknown> | null | undefined,
  getSettings: () => Settings,
) {
  function applyFeatureSettings(): void {
    const grid = getGrid()
    if (!grid) return

    const settings = getSettings()
    const features = grid['features'] as Record<string, { show?: () => void; hide?: () => void; disabled?: boolean }>

    const fb = features['filterBar'] as { showFilterBar?: () => void; hideFilterBar?: () => void } | undefined
    if (fb) settings.filters ? fb.showFilterBar?.() : fb.hideFilterBar?.()

    const grp = features['group']
    if (grp) {
      grp.disabled = !settings.grouping
      const store = grid['store'] as { group?: (f: string) => void; clearGroupers?: () => void }
      if (settings.grouping) store.group?.('department')
      else store.clearGroupers?.()
    }

    const stripe = features['stripe']
    if (stripe) stripe.disabled = !settings.striping

    // Expandable rows — RowExpander is always configured with a renderer;
    // toggle disabled state to show/hide the expand icons.
    const expander = features['rowExpander']
    if (expander) expander.disabled = !settings.expandable

    // Selection — show/hide the checkbox column by toggling its hidden prop.
    const cols = grid['columns'] as { query?: (fn: (c: Record<string,unknown>) => boolean) => Record<string,unknown>[] } | undefined
    const checkCol = cols?.query?.((c) => c['type'] === 'check')?.[0] as Record<string, unknown> | undefined
    if (checkCol) checkCol['hidden'] = !settings.selection

    // Custom cells — update the role column renderer live.
    const roleCol = cols?.query?.((c) => c['field'] === 'role')?.[0] as Record<string, unknown> | undefined
    if (roleCol) {
      const withRenderer = toBryntumColumns(COLUMNS, settings.customCells).find(c => c['field'] === 'role')
      if (withRenderer) {
        roleCol['renderer']   = withRenderer['renderer'] ?? null
        roleCol['htmlEncode'] = settings.customCells ? false : true
      }
    }
  }

  onMounted(() => nextTick(applyFeatureSettings))

  watch(
    () => {
      const s = getSettings()
      return [s.filters, s.grouping, s.striping, s.expandable, s.selection, s.customCells] as const
    },
    () => nextTick(applyFeatureSettings),
  )
}
