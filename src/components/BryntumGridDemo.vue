<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="exportCsv">⬇ CSV</button>
      <button @click="exportExcel">⬇ Excel</button>
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="sep" />
      <span class="row-count" v-if="data">{{ data.length.toLocaleString() }} rows</span>
      <span class="row-count" v-else-if="isLoading">Loading…</span>
      <span class="row-count error" v-else-if="isError">{{ error?.message }}</span>
      <a class="docs-link" href="https://bryntum.com/products/grid/docs/" target="_blank" rel="noopener">📖 Docs ↗</a>
    </div>
    <div class="b-grid-wrapper">
      <BryntumGrid
        ref="gridRef"
        :store="store"
        :columns="bryntumColumns"
        :sortFeature="'name'"
        :filterBarFeature="true"
        :groupFeature="true"
        :stripeFeature="true"
        :excelExporterFeature="true"
        :bbar="settings.scrollMode === 'paginate' ? { type: 'pagingtoolbar' } : null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref }             from 'vue'
import { BryntumGrid }     from '@bryntum/grid-vue-3'
import { useUsersQuery }         from '../composables/useUsersQuery'
import { COLUMNS, toBryntumColumns } from '../composables/useColumnDefs'
import { useBryntumFeatures }    from '../composables/useBryntumFeatures'
import { useBryntumStore }       from '../composables/useBryntumStore'
import type { Settings }         from '../types'

const props = defineProps<{ settings: Settings }>()

const { data, isLoading, isError, error } = useUsersQuery()

const { store } = useBryntumStore(data, () => props.settings)

// Cast needed: Bryntum's GridColumnConfig type is overly narrow (type: 'widget' only)
// Our columns are valid at runtime; the canonical type system can't express the full union.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bryntumColumns = toBryntumColumns(COLUMNS) as any[]

const gridRef = ref<InstanceType<typeof BryntumGrid> | null>(null)

function getGrid() {
  return (gridRef.value?.instance as Record<string, unknown>)?.['value'] as Record<string, unknown> | null
}

useBryntumFeatures(getGrid, () => props.settings)

function exportCsv(): void {
  const grid = getGrid()
  ;(grid?.['features'] as Record<string, { export: (cfg: object) => void }>)
    ?.['excelExporter']?.export({ exporterType: 'csv',  fileName: 'bryntum-export.csv' })
}

function exportExcel(): void {
  const grid = getGrid()
  ;(grid?.['features'] as Record<string, { export: (cfg: object) => void }>)
    ?.['excelExporter']?.export({ exporterType: 'xlsx', fileName: 'bryntum-export.xlsx' })
}

function clearFilters(): void {
  const grid = getGrid()
  ;(grid as { clearFilters?: () => void })?.clearFilters?.()
  store.clearFilters?.()
}
</script>
