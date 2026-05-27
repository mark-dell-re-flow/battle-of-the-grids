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
        :filterBarFeature="true"
        :groupFeature="true"
        :stripeFeature="true"
        :excelExporterFeature="true"
        :bbar="null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { BryntumGrid } from '@bryntum/grid-vue-3'

const props = defineProps({
  rowData:  { type: Array,  required: true },
  settings: { type: Object, required: true },
})

const gridRef = ref(null)

const COLUMNS = [
  { field: 'id',              text: 'ID',          type: 'number', flex: 1 },
  { field: 'name',            text: 'Name',                        flex: 2 },
  { field: 'department',      text: 'Department',                  flex: 2 },
  { field: 'country',         text: 'Country',                     flex: 2 },
  { field: 'salary',          text: 'Salary',      type: 'number', flex: 1, renderer: ({ value }) => value != null ? `$${value.toLocaleString()}` : '' },
  { field: 'startDate',       text: 'Start Date',                  flex: 1 },
  { field: 'performance',     text: 'Performance',                 flex: 2 },
  { field: 'status',          text: 'Status',                      flex: 1 },
  { field: 'yearsExperience', text: 'Exp (yrs)',   type: 'number', flex: 1 },
  { field: 'age',             text: 'Age',         type: 'number', flex: 1 },
]

const columns = COLUMNS

function getGrid() {
  return gridRef.value?.instance?.value
}

function applyFeatureSettings() {
  const grid = getGrid()
  if (!grid) return

  // FilterBar: hide/show the filter row (disabled only grays it out, not hides it)
  const fb = grid.features.filterBar
  if (fb) {
    if (props.settings.filters) fb.show()
    else fb.hide()
  }

  // Group: enable/disable right-click grouping
  const grp = grid.features.group
  if (grp) grp.disabled = !props.settings.grouping

  // Stripe: enable/disable alternating row colours
  const stripe = grid.features.stripe
  if (stripe) stripe.disabled = !props.settings.striping
}

onMounted(() => nextTick(applyFeatureSettings))

watch(
  () => [props.settings.filters, props.settings.grouping, props.settings.striping],
  () => nextTick(applyFeatureSettings),
)

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
