<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="exportCsv">⬇ CSV</button>
      <button @click="exportExcel">⬇ Excel</button>
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="sep" />
      <span class="row-count">{{ rowData.length.toLocaleString() }} rows</span>
    </div>
    <div class="b-grid-wrapper">
      <BryntumGrid
        ref="gridRef"
        :data="rowData"
        :columns="columns"
        :features="features"
        :sortFeature="'name'"
        :tbar="tbarConfig"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BryntumGrid } from '@bryntum/grid-vue-3'

defineProps({ rowData: { type: Array, required: true } })

const gridRef = ref(null)

const columns = [
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

const features = {
  sort:        true,
  filterBar:   true,
  group:       true,
  excelExporter: true,
  stripe:      true,
}

// Bryntum's built-in paging toolbar
const tbarConfig = {
  items: {
    pagingToolbar: {
      type: 'pagingtoolbar',
    }
  }
}

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
