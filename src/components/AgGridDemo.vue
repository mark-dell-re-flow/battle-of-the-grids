<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="exportCsv">⬇ CSV</button>
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="sep" />
      <span class="row-count">{{ rowData.length.toLocaleString() }} rows</span>
    </div>
    <div class="ag-grid-wrapper">
      <AgGridVue
        class="ag-theme-quartz"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :pagination="true"
        :paginationPageSize="100"
        :paginationPageSizeSelector="[50, 100, 500, 1000]"
        :rowGroupPanelShow="'always'"
        :groupDefaultExpanded="0"
        :suppressRowGroupHidesColumns="true"
        :animateRows="false"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import { shallowRef } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

defineProps({ rowData: { type: Array, required: true } })

const gridApi = shallowRef(null)

const columnDefs = [
  { field: 'id',              headerName: 'ID',          width: 80,  filter: 'agNumberColumnFilter', enableRowGroup: false },
  { field: 'name',            headerName: 'Name',        width: 180, filter: 'agTextColumnFilter' },
  { field: 'department',      headerName: 'Department',  width: 140, filter: 'agTextColumnFilter',   enableRowGroup: true },
  { field: 'country',         headerName: 'Country',     width: 160, filter: 'agTextColumnFilter',   enableRowGroup: true },
  { field: 'salary',          headerName: 'Salary',      width: 130, filter: 'agNumberColumnFilter', valueFormatter: p => p.value != null ? `$${p.value.toLocaleString()}` : '' },
  { field: 'startDate',       headerName: 'Start Date',  width: 130, filter: 'agDateColumnFilter' },
  { field: 'performance',     headerName: 'Performance', width: 180, filter: 'agTextColumnFilter',   enableRowGroup: true },
  { field: 'status',          headerName: 'Status',      width: 120, filter: 'agTextColumnFilter',   enableRowGroup: true },
  { field: 'yearsExperience', headerName: 'Exp (yrs)',   width: 110, filter: 'agNumberColumnFilter' },
  { field: 'age',             headerName: 'Age',         width: 80,  filter: 'agNumberColumnFilter' },
]

const defaultColDef = {
  sortable: true,
  resizable: true,
  floatingFilter: true,
}

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
