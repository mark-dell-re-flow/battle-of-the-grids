import { watch, onMounted, nextTick } from 'vue'
import type { Settings } from '../types'

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

    const fb = features['filterBar']
    if (fb) settings.filters ? fb.show?.() : fb.hide?.()

    const grp = features['group']
    if (grp) {
      grp.disabled = !settings.grouping
      // Auto-group by department so the toggle has immediate visible effect.
      // (Bryntum's group feature only adds a right-click menu — without this
      //  the toggle appears to do nothing.)
      const store = grid['store'] as { group?: (f: string) => void; clearGroupers?: () => void }
      if (settings.grouping) store.group?.('department')
      else store.clearGroupers?.()
    }

    const stripe = features['stripe']
    if (stripe) stripe.disabled = !settings.striping
  }

  onMounted(() => nextTick(applyFeatureSettings))

  watch(
    () => {
      const s = getSettings()
      return [s.filters, s.grouping, s.striping] as const
    },
    () => nextTick(applyFeatureSettings),
  )
}
