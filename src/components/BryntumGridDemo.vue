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

// Bryntum :columns prop is not reactive after init — update column models imperatively
watch(() => props.settings.columnSizing, (val) => {
  const grid = getGrid()
  if (!grid) return
  nextTick(() => {
    grid.columns.forEach(col => {
      const original = COLUMNS.find(c => c.field === col.field)
      if (val === 'fluid') {
        col.flex = 1
        col.width = null
      } else {
        col.flex = null
        col.width = original?.width ?? 120
      }
    })
  })
})

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
