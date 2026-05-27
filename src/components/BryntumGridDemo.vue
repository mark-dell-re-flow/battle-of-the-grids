<template>
  <div class="grid-wrapper">
    <div class="toolbar">
      <button @click="clearFilters" v-if="!settings.treeData">✕ Clear filters</button>
      <span class="server-badge" v-if="!settings.treeData">🌐 Sort/filter/page: server-side</span>
      <span class="server-badge" v-else>🌲 User → Post → Comment (lazy-loaded on expand)</span>
      <span class="info-badge" v-if="settings.cellEditing">✏️ Edits are local only</span>
      <span class="sep" />
      <span class="row-count selected" v-if="settings.selection && selectedCount > 0">{{ selectedCount }} selected</span>
      <span class="row-count" v-if="data && !settings.treeData">{{ data.length.toLocaleString() }} rows</span>
      <span class="row-count" v-else-if="isLoading && !settings.treeData">Loading…</span>
      <span class="row-count error" v-else-if="isError">{{ error?.message }}</span>
      <a class="docs-link" href="https://bryntum.com/products/grid/docs/" target="_blank" rel="noopener">📖 Docs ↗</a>
    </div>

    <!-- Normal grid -->
    <div class="b-grid-wrapper" v-if="!settings.treeData">
      <BryntumGrid
        ref="gridRef"
        :store="store"
        :columns="bryntumColumns"
        :sortFeature="'name'"
        :filterBarFeature="true"
        :groupFeature="true"
        :stripeFeature="true"
        :rowExpanderFeature="rowExpanderFeature"
        :cellEditFeature="true"
        :rowReorderFeature="true"
        :selectionMode="{ multiSelect: true, checkbox: true, showCheckAll: true }"
        :bbar="settings.scrollMode === 'paginate' ? { type: 'pagingtoolbar' } : null"
        @selectionChange="onSelectionChange"
      />
    </div>

    <!-- Tree grid -->
    <div class="b-grid-wrapper" v-else>
      <BryntumGrid
        ref="treeGridRef"
        :store="treeStore"
        :columns="treeColumns"
        :stripeFeature="true"
        :treeFeature="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useQueryClient }           from '@tanstack/vue-query'
import { BryntumGrid }              from '@bryntum/grid-vue-3'
import { useUsersQuery }            from '../composables/useUsersQuery'
import { COLUMNS, toBryntumColumns, toBryntumTreeColumns } from '../composables/useColumnDefs'
import { useBryntumFeatures }       from '../composables/useBryntumFeatures'
import { useBryntumStore, useBryntumTreeStore } from '../composables/useBryntumStore'
import type { Settings }            from '../types'

const props = defineProps<{ settings: Settings }>()

const { data, isLoading, isError, error } = useUsersQuery()

const { store }     = useBryntumStore(() => props.settings)
const { store: treeStore } = useBryntumTreeStore()

const qc = useQueryClient()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bryntumColumns = computed(() => toBryntumColumns(COLUMNS, props.settings.customCells) as any[])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const treeColumns = toBryntumTreeColumns() as any[]

// ─── Expandable row detail — lazy fetch user's posts, todos & carts ────────

interface PostItem    { id: number; title: string; views: number; reactions?: { likes: number } }
interface TodoItem    { id: number; todo: string; completed: boolean }
interface CartProduct { title: string; price: number; quantity: number }
interface CartItem    { products: CartProduct[]; total: number }

function buildDetailHtml(posts: PostItem[], todos: TodoItem[], carts: CartItem[]): string {
  const products = carts.flatMap(c => c.products)

  const postsHtml = posts.length
    ? `<table class="detail-table">
        <thead><tr><th>Title</th><th>Views</th><th>👍</th></tr></thead>
        <tbody>${posts.map(p =>
          `<tr><td>${p.title}</td><td>${p.views}</td><td>${p.reactions?.likes ?? 0}</td></tr>`
        ).join('')}</tbody>
       </table>`
    : '<em>No posts</em>'

  const todosHtml = todos.length
    ? `<ul class="detail-list">${todos.map(t =>
        `<li>${t.completed ? '✅' : '⭕'} ${t.todo}</li>`
      ).join('')}</ul>`
    : '<em>No todos</em>'

  const cartHtml = products.length
    ? `<table class="detail-table">
        <thead><tr><th>Product</th><th>Price</th><th>Qty</th></tr></thead>
        <tbody>${products.map(p =>
          `<tr><td>${p.title}</td><td>$${p.price}</td><td>${p.quantity}</td></tr>`
        ).join('')}</tbody>
       </table>`
    : '<em>Empty cart</em>'

  return `
    <div class="row-detail-sections">
      <div class="detail-section">
        <div class="detail-section-title">📝 Posts (${posts.length})</div>
        ${postsHtml}
      </div>
      <div class="detail-section">
        <div class="detail-section-title">✅ Todos (${todos.length})</div>
        ${todosHtml}
      </div>
      <div class="detail-section">
        <div class="detail-section-title">🛒 Cart (${products.length} items)</div>
        ${cartHtml}
      </div>
    </div>`
}

// RowExpander renderer — returns a DOM element immediately with a loading state,
// then swaps in fetched relational data once all 3 requests resolve.
// TanStack Query caches per userId — re-expanding is instant.
const rowExpanderFeature = {
  disabled: false,
  async renderer({ record }: { record: Record<string, unknown> }) {
    const userId = record['id'] as number

    const [postsData, todosData, cartsData] = await Promise.all([
      qc.fetchQuery({
        queryKey: ['user-posts', userId],
        queryFn:  () => fetch(
          `https://dummyjson.com/users/${userId}/posts?limit=10&select=id,title,views,reactions`
        ).then(r => r.json()),
        staleTime: 5 * 60 * 1000,
      }),
      qc.fetchQuery({
        queryKey: ['user-todos', userId],
        queryFn:  () => fetch(
          `https://dummyjson.com/users/${userId}/todos?limit=10`
        ).then(r => r.json()),
        staleTime: 5 * 60 * 1000,
      }),
      qc.fetchQuery({
        queryKey: ['user-carts', userId],
        queryFn:  () => fetch(
          `https://dummyjson.com/users/${userId}/carts`
        ).then(r => r.json()),
        staleTime: 5 * 60 * 1000,
      }),
    ])

    const posts = Array.isArray(postsData) ? postsData : (postsData.posts ?? [])
    const todos = Array.isArray(todosData) ? todosData : (todosData.todos ?? [])
    const carts = Array.isArray(cartsData) ? cartsData : (cartsData.carts ?? [])

    return buildDetailHtml(posts, todos, carts)
  },
}

const gridRef       = ref<InstanceType<typeof BryntumGrid> | null>(null)
const treeGridRef   = ref<InstanceType<typeof BryntumGrid> | null>(null)
const selectedCount = ref(0)

function getGrid() {
  return (gridRef.value?.instance as Record<string, unknown>)?.['value'] as Record<string, unknown> | null
}

useBryntumFeatures(getGrid, () => props.settings)

function onSelectionChange(e: { selection: unknown[] }): void {
  selectedCount.value = e.selection?.length ?? 0
}

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

.toolbar {
  .info-badge {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.78em;
    font-weight: 500;
  }
}

// Row expand detail panel — loading state
:deep(.row-detail-loading) {
  padding: 1rem 1.5rem;
  opacity: 0.6;
  font-style: italic;
}

// Row expand detail panel — 3-column grid layout
:deep(.row-detail-sections) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem 2rem;
  padding: 1rem 1.5rem;
  background: var(--b-panel-background, #1e1e2e);
}

:deep(.detail-section-title) {
  font-size: 0.78em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

:deep(.detail-table) {
  width: 100%;
  font-size: 0.8em;
  border-collapse: collapse;

  th {
    text-align: left;
    opacity: 0.6;
    font-size: 0.9em;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 2px 4px;
  }

  td {
    padding: 2px 4px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

:deep(.detail-list) {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.8em;
  max-height: 150px;
  overflow-y: auto;

  li {
    padding: 2px 0;
  }
}
</style>
