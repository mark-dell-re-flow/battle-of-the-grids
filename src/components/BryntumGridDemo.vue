<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="clearFilters">✕ Clear filters</button>
      <span class="server-badge">🌐 Sort/filter/page: server-side</span>
      <span class="sep" />
      <span class="row-count selected" v-if="settings.selection && selectedCount > 0">{{ selectedCount }} selected</span>
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
        :rowExpanderFeature="rowExpanderFeature"
        :selectionMode="{ multiSelect: true, checkbox: true, 
        showCheckAll : true }"
        :bbar="settings.scrollMode === 'paginate' ? { type: 'pagingtoolbar' } : null"
        @selectionChange="onSelectionChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { BryntumGrid }     from '@bryntum/grid-vue-3'
import { useUsersQuery }         from '../composables/useUsersQuery'
import { COLUMNS, toBryntumColumns } from '../composables/useColumnDefs'
import { useBryntumFeatures }    from '../composables/useBryntumFeatures'
import { useBryntumStore }       from '../composables/useBryntumStore'
import type { Settings }         from '../types'

const props = defineProps<{ settings: Settings }>()

const { data, isLoading, isError, error } = useUsersQuery()

const { store } = useBryntumStore(() => props.settings)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bryntumColumns = computed(() => toBryntumColumns(COLUMNS, props.settings.customCells) as any[])

// RowExpander detail panel — always configured; disabled state toggled imperatively.
const rowExpanderFeature = {
  disabled: true,
  renderer({ record }: { record: Record<string, unknown> }) {
    return `
      <div class="row-detail">
        <div class="row-detail-grid">
          <div><span>Department</span>${record['department']}</div>
          <div><span>Title</span>${record['title']}</div>
          <div><span>Company</span>${record['company']}</div>
          <div><span>Location</span>${record['state']}, ${record['country']}</div>
          <div><span>Age</span>${record['age']}</div>
          <div><span>Email</span><a href="mailto:${record['email']}">${record['email']}</a></div>
        </div>
      </div>`
  },
}

const gridRef      = ref<InstanceType<typeof BryntumGrid> | null>(null)
const selectedCount = ref(0)

function getGrid() {
  return (gridRef.value?.instance as Record<string, unknown>)?.['value'] as Record<string, unknown> | null
}

useBryntumFeatures(getGrid, () => props.settings)

// Keep selected count in sync — Bryntum fires selectionChange on the grid element.
function onSelectionChange(e: { selection: unknown[] }): void {
  selectedCount.value = e.selection?.length ?? 0
}

// Clear selection count when selection feature is toggled off.
watch(() => props.settings.selection, (on) => {
  if (!on) {
    selectedCount.value = 0
    nextTick(() => {
      const grid = getGrid() as { deselectAll?: () => void } | null
      grid?.deselectAll?.()
    })
  }
})

function clearFilters(): void {
  const grid = getGrid()
  ;(grid as { clearFilters?: () => void })?.clearFilters?.()
  store.clearFilters?.()
}
</script>

<style scoped lang="scss">
.b-grid-wrapper {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;

  :deep(.b-grid) {
    height: 100%;
  }
}

// Row expand detail panel
:deep(.row-detail) {
  padding: 1rem 1.5rem;
  background: var(--b-panel-background, #1e1e2e);

  .row-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem 2rem;

    div {
      span {
        display: block;
        font-size: 0.72em;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.6;
        margin-bottom: 2px;
      }
    }
  }
}
</style>
