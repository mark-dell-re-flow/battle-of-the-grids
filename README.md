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
| Row selection (checkbox) | ✅ | ✅ | ✅ |
| Expandable / detail rows | ❌ Enterprise only | ✅ Master/Detail | ✅ Native RowExpander |
| Custom cell renderers | ✅ `cellRenderer` function | ✅ | ✅ Column `renderer` function |
| Row grouping | ❌ Enterprise only | ✅ | ✅ |
| Pivoting | ❌ Enterprise only | ✅ | ❌ |
| Tree / hierarchical data | ❌ Enterprise only | ✅ | ✅ |
| CSV export | ✅ | ✅ | ✅ |
| Excel (.xlsx) export | ❌ Enterprise only | ✅ | ✅ Built-in (requires `exceljs` peer dep) |
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
- Row grouping, pivoting, tree data, Excel export, expandable rows, and server-side operations all require **Enterprise** licence
- Initial sort via `:initialState="{ sort: { sortModel: [...] } }"`
- `rowSelection` prop must be `undefined` (not `null`) to disable — passing `null` crashes with a `checkboxLocation` read error
- `cellRenderer` accepts a plain function returning an HTML string — no Vue component wrapper needed for simple cases

### Bryntum Grid
- Feature props (`:filterBarFeature`, `:stripeFeature`, etc.) are **not reactive** after mount — must use imperative watchers on the grid instance
- Filter bar: `grid.features.filterBar.showFilterBar()` / `hideFilterBar()` (not `show()`/`hide()`)
- Row grouping: right-click context menu only by default — call `store.group('field')` programmatically for visible grouping
- Pagination via `PagingToolbar` requires an `AjaxStore`; local `:data` prop does not work with it
- `AjaxHelper.mockUrl` can be async — use it to intercept and proxy to a real API
- `gridRef.value?.instance?.value` to access the raw grid instance from a Vue ref
- Feature names accessed via `grid.features`: `filterBar`, `group`, `stripe`, `rowExpander`
- Column flex: without explicit `flex` or `width`, the last column absorbs all remaining space
- `selectionMode: { multiSelect: true, checkbox: true }` must be set at init time — cannot be toggled reactively; show/hide the checkbox column imperatively via `grid.columns.query(c => c.type === 'check')[0].hidden`
- `RowExpander` renderer receives `{ record }` and returns an HTML string — great for detail panels
- Excel export requires `exceljs` as a peer dependency

### Server-side data (dummyjson)
- dummyjson only sorts on **top-level fields**: `id`, `firstName`, `age`, `email`, `role`
- Dot-notation nested paths (`company.name`, `address.state`, etc.) are silently ignored — the API returns unsorted data without an error
- Disable sorting on nested-field columns to avoid misleading UX

---

## What's togglable in this demo

| Setting | AG Grid behaviour | Bryntum behaviour |
|---|---|---|
| **Scroll → Paginate** | Built-in pagination toolbar | PagingToolbar via AjaxStore |
| **Scroll → Virtual** | Virtual row rendering | Virtual row rendering |
| **Filters** | Shows/hides floating filter row | Shows/hides filter bar |
| **Grouping** | ⚠️ Enterprise only — shows warning | Groups by Department |
| **Striping** | `--ag-odd-row-background-color` CSS var | Stripe feature |
| **Selection** | Reactive `rowSelection` prop; checkbox column + count badge | `selectionMode` set at init; checkbox column toggled imperatively |
| **Expandable** | ⚠️ Enterprise only — shows warning | Native `RowExpander`; lazy-fetches user's posts, todos & cart on open; cached via TanStack Query |
| **Custom cells** | `cellRenderer` function on Role column | Column `renderer` function on Role column |
| **Tree data** | ⚠️ Enterprise only — shows warning | AjaxStore in tree mode; User → Post → Comment; each level fetched on expand via `AjaxHelper.mockUrl` |
| **Cell editing** | `editable: true` in `defaultColDef`; local-only edits | `cellEdit` feature toggled imperatively; column `editor` set per type |
| **Row reorder** | `rowDragManaged` prop + `rowDrag` on Name column | `rowReorder` feature toggled imperatively |

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

**Choose AG Grid Community** if:
- You need a free/OSS grid and Community features (sort, filter, client-side pagination, selection, cell renderers) are enough
- Large community and Stack Overflow support matters
- You only need basic list-view display — no server-side ops, grouping, or row detail

**Choose AG Grid Enterprise** if:
- You need server-side row model, grouping, Master/Detail, or Excel export — and want AG Grid's excellent Vue 3 DX

**Choose Bryntum Grid** if:
- You need server-side operations, expandable rows, grouping, or Excel export without paying for Enterprise
- You also need Scheduler, Gantt, or Calendar — one licence covers the whole suite
- You're comfortable with the imperative API pattern for feature toggles

### Overall impression after hands-on comparison

> **Important caveat:** this demo compares **AG Grid Community (free)** against **Bryntum Grid (paid)**. They are not the same tier. AG Grid Enterprise includes server-side row model, expandable rows, grouping, Excel export, and more — we simply couldn't test those because we don't have a licence.

What we could compare fairly:

- **AG Grid Community DX** is smooth for the features it includes — reactive Vue props, accurate TypeScript, straightforward `cellRenderer` functions. No surprises within its scope.
- **Bryntum** required more initial wiring (imperative feature toggles, AjaxStore setup) but the features that are in scope — server-side pagination/sort, expandable rows, selection, custom renderers — all worked reliably once configured.
- The **practical gap** for real-world list views is that almost every feature beyond basic display (server-side data, expandable rows, grouping, Excel export) is Enterprise-gated in AG Grid but freely included in Bryntum's single licence.

If you're comparing on **cost**, AG Grid Community is MIT-free and Bryntum is paid. If you're comparing on **included features for a paid licence**, AG Grid Enterprise and Bryntum are much closer — and that's the comparison worth doing if you're serious about either.

**With the November 2025 partnership**, if you're already evaluating Bryntum's scheduling products, the Grid comes with the same licence — making it a natural choice to standardise on Bryntum across the board.

---

## Packages

- **AG Grid**: `ag-grid-community` + `ag-grid-vue3` — Community edition (MIT)
- **Bryntum Grid**: `@bryntum/grid` (aliased from `@bryntum/grid-trial`) + `@bryntum/grid-vue-3` — trial edition
- **TanStack Query**: `@tanstack/vue-query` — data fetching and caching
- **Data source**: [dummyjson.com/users](https://dummyjson.com/users) — 208 real-ish user records
