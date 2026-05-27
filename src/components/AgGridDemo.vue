<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="exportCsv">⬇ CSV</button>
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="limitation" v-if="settings.grouping">⚠ Grouping: Enterprise only</span>
      <span class="sep" />
      <span class="row-count" v-if="data">{{ data.length.toLocaleString() }} rows</span>
      <span class="row-count" v-else-if="isLoading">Loading…</span>
      <span class="row-count error" v-else-if="isError">{{ error?.message }}</span>
      <a class="docs-link" href="https://www.ag-grid.com/vue-data-grid/" target="_blank" rel="noopener">📖 Docs ↗</a>
    </div>
    <div class="ag-grid-wrapper" :style="stripeStyle">
      <AgGridVue
        class="ag-theme-quartz-auto-dark"
        :rowData="data ?? []"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :loading="isLoading"
        :pagination="settings.scrollMode === 'paginate'"
        :paginationPageSize="PAGE_SIZE"
        :paginationPageSizeSelector="[25, 50, 100]"
        :animateRows="false"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule, type GridApi } from 'ag-grid-community'
import { useUsersQuery }   from '../composables/useUsersQuery'
import { COLUMNS, toAgColumnDefs } from '../composables/useColumnDefs'
import type { Settings } from '../types'

ModuleRegistry.registerModules([AllCommunityModule])

const props = defineProps<{ settings: Settings }>()

const { data, isLoading, isError, error } = useUsersQuery()

const PAGE_SIZE = 25
const columnDefs   = toAgColumnDefs(COLUMNS)
const gridApi      = shallowRef<GridApi | null>(null)

const defaultColDef = computed(() => ({
  sortable:       true,
  resizable:      true,
  flex:           1,
  floatingFilter: props.settings.filters,
}))

const stripeStyle = computed(() =>
  props.settings.striping
    ? { '--ag-odd-row-background-color': 'rgba(0,0,0,0.06)' }
    : { '--ag-odd-row-background-color': 'transparent' }
)

function onGridReady(params: { api: GridApi }): void {
  gridApi.value = params.api
}

function exportCsv(): void {
  gridApi.value?.exportDataAsCsv({ fileName: 'ag-grid-export.csv' })
}

function clearFilters(): void {
  gridApi.value?.setFilterModel(null)
}
</script>
