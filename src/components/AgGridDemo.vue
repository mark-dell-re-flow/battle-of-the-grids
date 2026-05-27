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
import { computed, shallowRef } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

const props = defineProps({
  rowData:  { type: Array,  required: true },
  settings: { type: Object, required: true },
})

const gridApi = shallowRef(null)

const columnDefs = [
  { field: 'id',              headerName: 'ID',          filter: 'agNumberColumnFilter' },
  { field: 'name',            headerName: 'Name',        filter: 'agTextColumnFilter' },
  { field: 'department',      headerName: 'Department',  filter: 'agTextColumnFilter' },
  { field: 'country',         headerName: 'Country',     filter: 'agTextColumnFilter' },
  { field: 'salary',          headerName: 'Salary',      filter: 'agNumberColumnFilter', valueFormatter: p => p.value != null ? `$${p.value.toLocaleString()}` : '' },
  { field: 'startDate',       headerName: 'Start Date',  filter: 'agDateColumnFilter' },
  { field: 'performance',     headerName: 'Performance', filter: 'agTextColumnFilter' },
  { field: 'status',          headerName: 'Status',      filter: 'agTextColumnFilter' },
  { field: 'yearsExperience', headerName: 'Exp (yrs)',   filter: 'agNumberColumnFilter' },
  { field: 'age',             headerName: 'Age',         filter: 'agNumberColumnFilter' },
]

const defaultColDef = computed(() => ({
  sortable:       true,
  resizable:      true,
  flex:           1,
  floatingFilter: props.settings.filters,
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

function exportCsv() {
  gridApi.value?.exportDataAsCsv({ fileName: 'ag-grid-export.csv' })
}

function clearFilters() {
  gridApi.value?.setFilterModel(null)
}
</script>
