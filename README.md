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
| Pagination | ✅ Built-in | ✅ Paging toolbar |
| CSV export | ✅ Community | ✅ ExcelExporter feature |
| Excel export | ❌ Enterprise only | ✅ Built-in (trial) |
| Dark mode (`prefers-color-scheme`) | ✅ `ag-theme-quartz-auto-dark` | ⚠️ No built-in support — themed CSS files are static; would need manual JS to swap stylesheets at runtime |

## Known limitations found during setup

### AG Grid (Community)
- **Row grouping** — `enableRowGroup` on columns and `rowGroupPanelShow` are Enterprise-only. Throws a hard error if used with Community. No graceful degradation.
- **Excel export** — `.xlsx` export is Enterprise-only. Community supports CSV only.

### Bryntum Grid (Trial)
- **Dark mode** — None of the themed CSS files (`stockholm-light.css`, `stockholm-dark.css`, etc.) include a `prefers-color-scheme` media query. The default `grid.css` is also static. Matching OS dark/light mode requires manually swapping stylesheets via JavaScript at runtime.

## Dataset

100,000 fake employee rows generated in `src/data/generateData.js` — deterministic (same data every run). Fields: id, name, department, country, salary, startDate, performance, status, yearsExperience, age.

## Packages

- **AG Grid**: `ag-grid-community` + `ag-grid-vue3` — free, open-source Community edition
- **Bryntum Grid**: `@bryntum/grid` (aliased from `@bryntum/grid-trial`) + `@bryntum/grid-vue-3` — trial edition from public npm
