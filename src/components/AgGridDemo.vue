<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="exportCsv">⬇ CSV</button>
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="limitation" v-if="settings.grouping">⚠ Grouping: Enterprise only</span>
      <span class="sep" />
      <span class="row-count">{{ rowData.length.toLocaleString() }} rows</span>
      <a class="docs-link" href="https://www.ag-grid.com/vue-data-grid/" target="_blank" rel="noopener">📖 Docs ↗</a>
    </div>
    <div class="ag-grid-wrapper" :style="stripeStyle">
      <AgGridVue
        class="ag-theme-quartz-auto-dark"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :pagination="settings.scrollMode === 'paginate'"
        :paginationPageSize="100"
        :paginationPageSizeSelector="[50, 100, 500, 1000]"
        :animateRows="false"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, shallowRef, watch, nextTick } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

const props = defineProps({
  rowData:  { type: Array,  required: true },
  settings: { type: Object, required: true },
})

const gridApi = shallowRef(null)

const COLUMN_DEFS = [
  { field: 'id',              headerName: 'ID',          width: 80,  filter: 'agNumberColumnFilter' },
  { field: 'name',            headerName: 'Name',        width: 180, filter: 'agTextColumnFilter' },
  { field: 'department',      headerName: 'Department',  width: 140, filter: 'agTextColumnFilter' },
  { field: 'country',         headerName: 'Country',     width: 160, filter: 'agTextColumnFilter' },
  { field: 'salary',          headerName: 'Salary',      width: 130, filter: 'agNumberColumnFilter', valueFormatter: p => p.value != null ? `$${p.value.toLocaleString()}` : '' },
  { field: 'startDate',       headerName: 'Start Date',  width: 130, filter: 'agDateColumnFilter' },
  { field: 'performance',     headerName: 'Performance', width: 180, filter: 'agTextColumnFilter' },
  { field: 'status',          headerName: 'Status',      width: 120, filter: 'agTextColumnFilter' },
  { field: 'yearsExperience', headerName: 'Exp (yrs)',   width: 110, filter: 'agNumberColumnFilter' },
  { field: 'age',             headerName: 'Age',         width: 80,  filter: 'agNumberColumnFilter' },
]

// Strip explicit widths in fluid mode so flex:1 from defaultColDef takes effect
const columnDefs = computed(() =>
  props.settings.columnSizing === 'fluid'
    ? COLUMN_DEFS.map(({ width, ...col }) => col)
    : COLUMN_DEFS
)

const defaultColDef = computed(() => ({
  sortable:       true,
  resizable:      true,
  floatingFilter: props.settings.filters,
  ...(props.settings.columnSizing === 'fluid' ? { flex: 1 } : {}),
}))

// AG Grid uses --ag-odd-row-background-color for striping
const stripeStyle = computed(() =>
  props.settings.striping
    ? { '--ag-odd-row-background-color': 'rgba(0,0,0,0.06)' }
    : { '--ag-odd-row-background-color': 'transparent' }
)

function onGridReady(params) {
  gridApi.value = params.api
}

// After switching to fluid, tell AG Grid to fill available width
watch(() => props.settings.columnSizing, (val) => {
  if (val === 'fluid') nextTick(() => gridApi.value?.sizeColumnsToFit())
})

function exportCsv() {
  gridApi.value?.exportDataAsCsv({ fileName: 'ag-grid-export.csv' })
}

function clearFilters() {
  gridApi.value?.setFilterModel(null)
}
</script>
