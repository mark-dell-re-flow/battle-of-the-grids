import type { CanonicalColumn } from '../types'

export const COLUMNS: CanonicalColumn[] = [
  { field: 'id',         label: 'ID',         type: 'number', flex: 1 },
  { field: 'name',       label: 'Name',       type: 'text',   flex: 2 },
  { field: 'department', label: 'Department', type: 'text',   flex: 2, sortable: false },
  { field: 'title',      label: 'Title',      type: 'text',   flex: 2, sortable: false },
  { field: 'company',    label: 'Company',    type: 'text',   flex: 2, sortable: false },
  { field: 'role',       label: 'Role',       type: 'text',   flex: 1 },
  { field: 'country',    label: 'Country',    type: 'text',   flex: 2, sortable: false },
  { field: 'state',      label: 'State',      type: 'text',   flex: 1, sortable: false },
  { field: 'age',        label: 'Age',        type: 'number', flex: 1 },
  { field: 'email',      label: 'Email',      type: 'text',   flex: 2 },
]

const ROLE_COLORS: Record<string, string> = {
  admin:     '#ef4444',
  moderator: '#3b82f6',
  user:      '#22c55e',
}

const NODE_TYPE_COLORS: Record<string, string> = {
  user:    '#8b5cf6',
  post:    '#0284c7',
  comment: '#22c55e',
}

function roleBadgeHtml(value: string): string {
  const bg = ROLE_COLORS[value] ?? '#6b7280'
  return `<span style="background:${bg};color:#fff;padding:2px 10px;border-radius:12px;font-size:0.78em;font-weight:600;letter-spacing:0.03em">${value}</span>`
}

function nodeTypeBadgeHtml(value: string): string {
  const bg = NODE_TYPE_COLORS[value] ?? '#6b7280'
  return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:12px;font-size:0.75em;font-weight:600;letter-spacing:0.04em">${value}</span>`
}

/** Transform canonical columns into AG Grid columnDefs */
export function toAgColumnDefs(cols: CanonicalColumn[], customCells = false, rowDrag = false) {
  return cols.map(col => ({
    field:      col.field as string,
    headerName: col.label,
    flex:       col.flex,
    filter:     col.type === 'number' ? 'agNumberColumnFilter' : 'agTextColumnFilter',
    ...(col.sortable === false ? { sortable: false } : {}),
    ...(customCells && col.field === 'role'
      ? { cellRenderer: (p: { value: string }) => roleBadgeHtml(p.value) }
      : {}),
    ...(rowDrag && col.field === 'name' ? { rowDrag: true } : {}),
  }))
}

/** Transform canonical columns into Bryntum column configs */
export function toBryntumColumns(cols: CanonicalColumn[], customCells = false): Record<string, unknown>[] {
  return cols.map(col => ({
    field:    col.field as string,
    text:     col.label,
    flex:     col.flex,
    sortable: col.sortable !== false,
    ...(col.type === 'number' ? { type: 'number' } : {}),
    ...(customCells && col.field === 'role'
      ? { renderer: ({ value }: { value: string }) => roleBadgeHtml(value), htmlEncode: false }
      : {}),
  }))
}

/** Columns for Bryntum tree mode: User → Post → Comment */
export function toBryntumTreeColumns(): Record<string, unknown>[] {
  return [
    { field: 'name',     text: 'Name',   flex: 3, tree: true },
    {
      field:     'nodeType',
      text:      'Type',
      width:     100,
      renderer:  ({ value }: { value: string }) => nodeTypeBadgeHtml(value),
      htmlEncode: false,
    },
    { field: 'info',    text: 'Info',   flex: 2 },
    { field: 'detail',  text: 'Detail', flex: 2 },
    { field: 'numeric', text: '#',      width: 80, type: 'number' },
  ]
}
