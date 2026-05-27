<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="exportCsv">⬇ CSV</button>
      <button @click="exportExcel">⬇ Excel</button>
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="limitation" v-if="settings.scrollMode === 'paginate'">⚠ Pagination: server-side stores only</span>
      <span class="sep" />
      <span class="row-count">{{ rowData.length.toLocaleString() }} rows</span>
      <a class="docs-link" href="https://bryntum.com/products/grid/docs/" target="_blank" rel="noopener">📖 Docs ↗</a>
    </div>
    <div class="b-grid-wrapper">
      <BryntumGrid
        ref="gridRef"
        :data="rowData"
        :columns="columns"
        :sortFeature="'name'"
        :filterBarFeature="settings.filters ? { disabled: false } : { disabled: true }"
        :groupFeature="settings.grouping ? { disabled: false } : { disabled: true }"
        :stripeFeature="settings.striping ? { disabled: false } : { disabled: true }"
        :excelExporterFeature="true"
        :bbar="null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BryntumGrid } from '@bryntum/grid-vue-3'

const props = defineProps({
  rowData:  { type: Array,  required: true },
  settings: { type: Object, required: true },
})

const gridRef = ref(null)

const COLUMNS = [
  { field: 'id',              text: 'ID',          width: 80,  type: 'number' },
  { field: 'name',            text: 'Name',        width: 180 },
  { field: 'department',      text: 'Department',  width: 140 },
  { field: 'country',         text: 'Country',     width: 160 },
  { field: 'salary',          text: 'Salary',      width: 130, type: 'number', renderer: ({ value }) => value != null ? `$${value.toLocaleString()}` : '' },
  { field: 'startDate',       text: 'Start Date',  width: 130 },
  { field: 'performance',     text: 'Performance', width: 180 },
  { field: 'status',          text: 'Status',      width: 120 },
  { field: 'yearsExperience', text: 'Exp (yrs)',   width: 110, type: 'number' },
  { field: 'age',             text: 'Age',         width: 80,  type: 'number' },
]

const columns = computed(() =>
  props.settings.columnSizing === 'fixed'
    ? COLUMNS
    : COLUMNS.map(({ width, ...col }) => col)
)

function getGrid() {
  return gridRef.value?.instance?.value
}

function exportCsv() {
  getGrid()?.features.excelExporter.export({ exporterType: 'csv', fileName: 'bryntum-export.csv' })
}

function exportExcel() {
  getGrid()?.features.excelExporter.export({ exporterType: 'xlsx', fileName: 'bryntum-export.xlsx' })
}

function clearFilters() {
  getGrid()?.clearFilters()
}
</script>
