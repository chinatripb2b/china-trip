import { createContext } from 'react';

// ==================== 类型定义 (参考 NocoDB ColumnType) ====================

export type UITypes =
  | 'SingleLineText'
  | 'LongText'
  | 'Number'
  | 'Decimal'
  | 'Checkbox'
  | 'SingleSelect'
  | 'MultiSelect'
  | 'Date'
  | 'DateTime'
  | 'Email'
  | 'URL';

export interface SelectOption {
  id: string;
  title: string;
  color: string;
}

export interface Column {
  id: string;
  title: string;
  uidt: UITypes;
  width: number;
  show: boolean;
  meta?: { options?: SelectOption[] };
}

export interface Row {
  id: number;
  rowData: Record<string, unknown>;
  rowMeta: {
    selected: boolean;
    saving: boolean;
    changed: boolean;
  };
}

export interface Cell {
  row: number | null;
  col: number | null;
}

export interface CellRange {
  start: Cell;
  end: Cell;
}

// ==================== 筛选/排序/分组 类型定义 ====================

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte';

export interface FilterCondition {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: unknown;
}

export interface SortConfig {
  fieldId: string;
  direction: 'asc' | 'desc';
}

export interface GroupConfig {
  fieldId: string | null;
}

export interface GroupedRows {
  [groupKey: string]: Row[];
}

// ==================== Context (参考 NocoDB Injection 模式) ====================

export interface GridContextType {
  columns: Column[];
  rows: Row[];
  activeCell: Cell;
  selectedRange: CellRange;
  editEnabled: boolean;
  setActiveCell: (cell: Cell) => void;
  setSelectedRange: (range: CellRange) => void;
  setEditEnabled: (enabled: boolean) => void;
  updateCell: (rowIndex: number, colId: string, value: unknown) => void;
  isInRange: (row: number, col: number) => boolean;
  handleMouseDown: (row: number, col: number, shiftKey: boolean) => void;
  handleMouseOver: (row: number, col: number) => void;
}

export const GridContext = createContext<GridContextType | null>(null);
