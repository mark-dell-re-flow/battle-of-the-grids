import { watch, onMounted, nextTick } from 'vue'
import type { Settings } from '../types'

/**
 * Drives Bryntum feature toggles imperatively.
 * Bryntum's Vue prop bindings are not reactive after init — features must be
 * enabled/disabled via the instance API using onMounted + watch.
 */
export function useBryntumFeatures(
  getGrid: () => Record<string, unknown> | null | undefined,
  settings: Settings,
) {
  function applyFeatureSettings(): void {
    const grid = getGrid()
    if (!grid) return

    const features = grid['features'] as Record<string, { show?: () => void; hide?: () => void; disabled?: boolean }>

    const fb = features['filterBar']
    if (fb) settings.filters ? fb.show?.() : fb.hide?.()

    const grp = features['group']
    if (grp) grp.disabled = !settings.grouping

    const stripe = features['stripe']
    if (stripe) stripe.disabled = !settings.striping
  }

  onMounted(() => nextTick(applyFeatureSettings))

  watch(
    () => [settings.filters, settings.grouping, settings.striping],
    () => nextTick(applyFeatureSettings),
  )
}
