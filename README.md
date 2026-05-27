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
| Row grouping | ✅ Drag-to-group panel | ✅ Right-click / group feature |
| Virtualisation | ✅ (built-in) | ✅ (built-in) |
| Pagination | ✅ Built-in | ✅ Paging toolbar |
| CSV export | ✅ Community | ✅ ExcelExporter feature |
| Excel export | ❌ Enterprise only | ✅ Built-in (trial) |

## Dataset

100,000 fake employee rows generated in `src/data/generateData.js` — deterministic (same data every run). Fields: id, name, department, country, salary, startDate, performance, status, yearsExperience, age.

## Packages

- **AG Grid**: `ag-grid-community` + `ag-grid-vue3` — free, open-source Community edition
- **Bryntum Grid**: `@bryntum/grid` (aliased from `@bryntum/grid-trial`) + `@bryntum/grid-vue-3` — trial edition from public npm
