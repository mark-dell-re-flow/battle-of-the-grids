<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="limitation" v-if="settings.grouping">⚠ Grouping: Enterprise only</span>
      <span class="limitation" v-if="settings.expandable">⚠ Expandable rows: Enterprise only</span>
      <span class="limitation">⚠ Server-side sort/filter/page: Enterprise only</span>
      <span class="sep" />
      <span class="row-count selected" v-if="settings.selection && selectedCount > 0">{{ selectedCount }} selected</span>
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
        :rowSelection="rowSelection"
        :loading="isLoading"
        :initialState="{ sort: { sortModel: [{ colId: 'name', sort: 'asc' }] } }"
        :pagination="settings.scrollMode === 'paginate'"
        :paginationPageSize="PAGE_SIZE"
        :paginationPageSizeSelector="[25, 50, 100]"
        :animateRows="false"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule, type GridApi } from 'ag-grid-community'
import { useUsersQuery }   from '../composables/useUsersQuery'
import { COLUMNS, toAgColumnDefs } from '../composables/useColumnDefs'
import type { Settings } from '../types'

ModuleRegistry.registerModules([AllCommunityModule])

const props = defineProps<{ settings: Settings }>()

const { data, isLoading, isError, error } = useUsersQuery()

const PAGE_SIZE    = 25
const gridApi      = shallowRef<GridApi | null>(null)
const selectedCount = ref(0)

const columnDefs = computed(() => toAgColumnDefs(COLUMNS, props.settings.customCells))

const rowSelection = computed(() =>
  props.settings.selection
    ? { mode: 'multiRow' as const, checkboxes: true, headerCheckbox: true }
    : undefined
)

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

function onSelectionChanged(): void {
  selectedCount.value = gridApi.value?.getSelectedRows().length ?? 0
}

function clearFilters(): void {
  gridApi.value?.setFilterModel(null)
}
</script>

<style scoped lang="scss">
.ag-grid-wrapper {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;

  :deep([class^="ag-theme-"]) {
    height: 100%;
    width: 100%;
  }

  // AG Grid sets height:0 on ag-root-wrapper-body (ag-layout-normal) internally.
  // Combined with our flex-column layout this causes filter popups to push row
  // content out of view. Override so our flex handles the sizing instead.
  :deep(.ag-root-wrapper-body.ag-layout-normal) {
    height: auto;
    flex: 1 1 auto;
  }
}
</style>
