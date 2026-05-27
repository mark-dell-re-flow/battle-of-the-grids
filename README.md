# ⚔️ Battle of the Grids

Side-by-side comparison of **AG Grid** and **Bryntum Grid** — loaded with real data from [dummyjson.com](https://dummyjson.com), built with Vue 3 + TypeScript + TanStack Query.

🔗 **Live demo:** https://mark-dell-re-flow.github.io/battle-of-the-grids/

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and switch between the two tabs.

---

## Feature comparison

| Feature | AG Grid Community | AG Grid Enterprise | Bryntum Grid |
|---|---|---|---|
| Sorting (multi-column) | ✅ Client-side | ✅ Client or server-side | ✅ Client or server-side |
| Filtering | ✅ Client-side floating filters | ✅ Client or server-side | ✅ Client or server-side |
| Virtual scrolling | ✅ | ✅ | ✅ |
| Pagination | ✅ Client-side | ✅ Client or server-side | ⚠️ Server-side (AjaxStore) only |
| **Server-Side Row Model** | ❌ Enterprise only | ✅ | ✅ Native via AjaxStore |
| Row grouping | ❌ Enterprise only | ✅ | ✅ |
| Pivoting | ❌ Enterprise only | ✅ | ❌ |
| Tree / hierarchical data | ❌ Enterprise only | ✅ | ✅ |
| CSV export | ✅ | ✅ | ✅ |
| Excel (.xlsx) export | ❌ Enterprise only | ✅ | ✅ Built-in |
| Integrated charting | ❌ | ✅ AG Charts | ❌ (separate AG Charts product) |
| Column types (percent, rating…) | ❌ Custom renderers needed | ❌ | ✅ Built-in |
| Row reordering (drag) | ✅ | ✅ | ✅ |
| Cell editing | ✅ | ✅ | ✅ |
| Vue 3 reactivity | ✅ Native | ✅ Native | ⚠️ Feature props not reactive after init; requires imperative watchers |
| TypeScript quality | ✅ Excellent | ✅ Excellent | ⚠️ Types exist but can be imprecise |
| Community / Stack Overflow | ✅ Large | ✅ Large | ⚠️ Smaller |
| Open source | ✅ MIT (Community) | ❌ | ❌ |
| Scheduling / Gantt / Calendar | ❌ | ❌ | ✅ Bryntum suite |

---

## Developer experience notes

### AG Grid
- Props are fully reactive — change anything and the grid updates automatically
- TypeScript types are accurate and complete
- `floatingFilter: true` on `defaultColDef` enables per-column filter inputs
- Fluid columns: `flex: 1` in `defaultColDef`; no explicit widths needed
- Row grouping, pivoting, tree data, and Excel export all require **Enterprise** licence
- Initial sort via `:initialState="{ sort: { sortModel: [...] } }"`

### Bryntum Grid
- Feature props (`:filterBarFeature`, `:stripeFeature`, etc.) are **not reactive** after mount — must use imperative watchers on the grid instance
- Filter bar: `grid.showFilterBar()` / `grid.hideFilterBar()` on the feature instance (not `show()`/`hide()`)
- Row grouping: right-click context menu only by default — call `store.group('field')` programmatically for visible grouping
- Pagination via `PagingToolbar` requires an `AjaxStore`; local `:data` prop does not work with it. Use `AjaxHelper.mockUrl` to simulate a server endpoint backed by local data
- `gridRef.value?.instance?.value` to access the raw grid instance from a Vue ref
- Feature names: `filterBar`, `group`, `stripe`, `excelExporter`
- Column flex: without explicit `flex` or `width`, the last column absorbs all remaining space

---

## What's togglable in this demo

| Setting | AG Grid behaviour | Bryntum behaviour |
|---|---|---|
| **Scroll → Paginate** | Built-in pagination toolbar | PagingToolbar via AjaxStore mock |
| **Scroll → Virtual** | Virtual row rendering | Virtual row rendering |
| **Filters** | Shows/hides floating filter row | Shows/hides filter bar |
| **Grouping** | ⚠️ Enterprise only — shows warning | Groups by Department |
| **Striping** | `--ag-odd-row-background-color` CSS var | Stripe feature |

---

## Architecture

All non-display code is shared via composables:

| File | Purpose |
|---|---|
| `src/types.ts` | `User`, `Settings`, `CanonicalColumn` interfaces |
| `src/composables/useUsersQuery.ts` | TanStack Query hook — fetches from dummyjson.com |
| `src/composables/useColumnDefs.ts` | Shared column list + `toAgColumnDefs()` / `toBryntumColumns()` |
| `src/composables/useBryntumFeatures.ts` | Imperative feature toggle logic for Bryntum |
| `src/composables/useBryntumStore.ts` | AjaxStore + `AjaxHelper.mockUrl` backed by TQ data |

Each grid component only contains its own template and wiring.

---

## When to choose each

**Choose AG Grid** if:
- You need great Vue 3 reactivity and TypeScript DX out of the box
- Community (free/OSS) tier covers your feature needs
- Large community and Stack Overflow support matters
- You only need a data grid (no scheduling/Gantt)

**Choose Bryntum Grid** if:
- You also need Scheduler, Gantt, or Calendar — consistent engine, one licence, one API
- Excel export out of the box is a requirement
- You need richer built-in column types (percent, rating, etc.)
- You're comfortable with the imperative API pattern

**With the November 2025 partnership**, if you're already evaluating Bryntum's scheduling products, the Grid comes with the same licence — making it a natural choice to standardise on Bryntum across the board. For pure list-view use cases with no scheduling needs, AG Grid's developer experience is smoother day-to-day.

---

## Packages

- **AG Grid**: `ag-grid-community` + `ag-grid-vue3` — Community edition (MIT)
- **Bryntum Grid**: `@bryntum/grid` (aliased from `@bryntum/grid-trial`) + `@bryntum/grid-vue-3` — trial edition
- **TanStack Query**: `@tanstack/vue-query` — data fetching and caching
- **Data source**: [dummyjson.com/users](https://dummyjson.com/users) — 208 real-ish user records
