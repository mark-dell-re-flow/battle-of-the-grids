import type { CanonicalColumn } from '../types'

export const COLUMNS: CanonicalColumn[] = [
  { field: 'id',         label: 'ID',         type: 'number', flex: 1 },
  { field: 'name',       label: 'Name',       type: 'text',   flex: 2 },
  { field: 'department', label: 'Department', type: 'text',   flex: 2 },
  { field: 'title',      label: 'Title',      type: 'text',   flex: 2 },
  { field: 'company',    label: 'Company',    type: 'text',   flex: 2 },
  { field: 'role',       label: 'Role',       type: 'text',   flex: 1 },
  { field: 'country',    label: 'Country',    type: 'text',   flex: 2 },
  { field: 'state',      label: 'State',      type: 'text',   flex: 1 },
  { field: 'age',        label: 'Age',        type: 'number', flex: 1 },
  { field: 'email',      label: 'Email',      type: 'text',   flex: 2 },
]

/** Transform canonical columns into AG Grid columnDefs */
export function toAgColumnDefs(cols: CanonicalColumn[]) {
  return cols.map(col => ({
    field:      col.field as string,
    headerName: col.label,
    flex:       col.flex,
    filter:     col.type === 'number' ? 'agNumberColumnFilter' : 'agTextColumnFilter',
  }))
}

/** Transform canonical columns into Bryntum column configs */
export function toBryntumColumns(cols: CanonicalColumn[]): Record<string, unknown>[] {
  return cols.map(col => ({
    field: col.field as string,
    text:  col.label,
    flex:  col.flex,
    ...(col.type === 'number' ? { type: 'number' } : {}),
  }))
}
