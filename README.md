# ⚔️ Battle of the Grids

Side-by-side comparison of **AG Grid** and **Bryntum Grid** — both loaded with the same 100,000-row dataset.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and switch between the two tabs.

## What's set up

| Feature | AG Grid | Bryntum Grid |
|---|---|---|
| Sorting | ✅ Multi-column | ✅ Multi-column |
| Filtering | ✅ Floating filters per column | ✅ Filter bar |
| Row grouping | ❌ Enterprise only | ✅ Right-click / group feature |
| Virtualisation | ✅ (built-in) | ✅ (built-in) |
| Pagination | ✅ Built-in | ⚠️ PagingToolbar is server-side only; not usable with local data |
| CSV export | ✅ Community | ✅ ExcelExporter feature |
| Excel export | ❌ Enterprise only | ✅ Built-in (trial) |
| Dark mode (`prefers-color-scheme`) | ✅ `ag-theme-quartz-auto-dark` | ⚠️ No built-in support — themed CSS files are static; would need manual JS to swap stylesheets at runtime |

## Known limitations found during setup

### AG Grid (Community)
- **Row grouping** — `enableRowGroup` on columns and `rowGroupPanelShow` are Enterprise-only. Throws a hard error if used with Community. No graceful degradation.
- **Excel export** — `.xlsx` export is Enterprise-only. Community supports CSV only.

### Bryntum Grid (Trial)
- **Dark mode** — all themed CSS files (`stockholm-light.css`, `stockholm-dark.css`, etc.) are static; no `prefers-color-scheme` support built in. Would need JS-driven stylesheet swapping to match OS theme.
- **Pagination with local data** — `PagingToolbar` is designed for server-side (remote) stores. Passing local data via the `data` prop shows "No records to display". Bryntum relies on virtual scrolling for large local datasets instead.

## Dataset

100,000 fake employee rows generated in `src/data/generateData.js` — deterministic (same data every run). Fields: id, name, department, country, salary, startDate, performance, status, yearsExperience, age.

## Packages

- **AG Grid**: `ag-grid-community` + `ag-grid-vue3` — free, open-source Community edition
- **Bryntum Grid**: `@bryntum/grid` (aliased from `@bryntum/grid-trial`) + `@bryntum/grid-vue-3` — trial edition from public npm
