export interface User {
  id:         number
  name:       string
  department: string
  title:      string
  company:    string
  role:       string
  country:    string
  state:      string
  age:        number
  email:      string
}

export interface Settings {
  scrollMode:  'paginate' | 'virtual'
  filters:     boolean
  grouping:    boolean
  striping:    boolean
  selection:   boolean
  expandable:  boolean
  customCells: boolean
  treeData:    boolean
  cellEditing: boolean
  rowReorder:  boolean
}

export interface CanonicalColumn {
  field:    keyof User
  label:    string
  type:     'text' | 'number'
  flex:     number
  /** false = dummyjson cannot sort this field server-side (nested path) */
  sortable?: boolean
}
