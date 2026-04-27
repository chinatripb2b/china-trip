import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Cell,
  CellRange,
  Column,
  FilterCondition,
  GridContextType,
  GroupConfig,
  GroupedRows,
  Row,
  SortConfig,
} from '@/components/types';
import { GridContext } from '@/components/types';

// ==================== 本地工具函数 ====================

function getCellValue(row: Row, fieldId: string): unknown {
  return row.rowData[fieldId];
}

function isNumericColumn(column?: Column): boolean {
  return column?.uidt === 'Number' || column?.uidt === 'Decimal';
}

function isDateColumn(column?: Column): boolean {
  return column?.uidt === 'Date' || column?.uidt === 'DateTime';
}

function applyFilter(
  row: Row,
  filter: FilterCondition,
  columns: Column[],
): boolean {
  const value = getCellValue(row, filter.fieldId);
  const column = columns.find((col) => col.id === filter.fieldId);

  if (value === undefined || value === null || value === '') {
    return (
      filter.operator === 'isEmpty' ||
      (filter.operator === 'equals' && filter.value === null)
    );
  }

  switch (filter.operator) {
    case 'equals':
      return value === filter.value;
    case 'notEquals':
      return value !== filter.value;
    case 'contains':
      return String(value)
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());
    case 'notContains':
      return !String(value)
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());
    case 'isEmpty':
      return value === '';
    case 'isNotEmpty':
      return value !== '';
    case 'gt':
      return Number(value) > Number(filter.value);
    case 'lt':
      return Number(value) < Number(filter.value);
    case 'gte':
      return Number(value) >= Number(filter.value);
    case 'lte':
      return Number(value) <= Number(filter.value);
    default:
      return true;
  }
}

function applySorting(
  a: Row,
  b: Row,
  sorts: SortConfig[],
  columns: Column[],
): number {
  for (const sort of sorts) {
    const aValue = getCellValue(a, sort.fieldId);
    const bValue = getCellValue(b, sort.fieldId);
    const column = columns.find((col) => col.id === sort.fieldId);

    if (aValue === bValue) continue;

    let comparison = 0;

    if (aValue === null || aValue === undefined) {
      comparison = sort.direction === 'asc' ? -1 : 1;
    } else if (bValue === null || bValue === undefined) {
      comparison = sort.direction === 'asc' ? 1 : -1;
    } else if (isNumericColumn(column)) {
      comparison = Number(aValue) - Number(bValue);
    } else if (isDateColumn(column)) {
      comparison =
        new Date(String(aValue)).getTime() -
        new Date(String(bValue)).getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  }

  return 0;
}

function groupRows(rows: Row[], groupConfig: GroupConfig): GroupedRows {
  if (!groupConfig.fieldId) {
    return { __all__: rows };
  }

  const grouped: GroupedRows = {};

  for (const row of rows) {
    const groupValue = String(getCellValue(row, groupConfig.fieldId) ?? '__empty__');
    if (!grouped[groupValue]) {
      grouped[groupValue] = [];
    }
    grouped[groupValue].push(row);
  }

  return grouped;
}

export const useGrid = (): GridContextType => {
  const context = useContext(GridContext);
  if (!context) throw new Error('useGrid must be used within GridProvider');
  return context;
};

// ==================== Hooks (参考 NocoDB Composables) ====================

/**
 * useMultiSelect - 参考 nc-gui/composables/useMultiSelect
 * 管理单元格选择、键盘导航、范围选择
 */
export function useMultiSelect(
  rowCount: number,
  colCount: number,
  onCellChange?: (row: number, col: number) => void,
) {
  const [activeCell, setActiveCell] = useState<Cell>({ row: null, col: null });
  const [selectedRange, setSelectedRange] = useState<CellRange>({
    start: { row: null, col: null },
    end: { row: null, col: null },
  });
  const [editEnabled, setEditEnabled] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 使用 ref 存储状态，避免回调依赖变化导致的重建
  const activeCellRef = useRef(activeCell);
  activeCellRef.current = activeCell;
  const selectedRangeRef = useRef(selectedRange);
  selectedRangeRef.current = selectedRange;

  // 检查单元格是否在选中范围内 - 使用 ref 避免依赖变化导致的回调重建
  const isInRange = useCallback((row: number, col: number): boolean => {
    const { start, end } = selectedRangeRef.current;
    if (
      start.row === null ||
      start.col === null ||
      end.row === null ||
      end.col === null
    ) {
      return (
        activeCellRef.current.row === row && activeCellRef.current.col === col
      );
    }
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }, []);

  // 键盘导航 - 参考 handleKeyDownAction
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeCell.row === null || activeCell.col === null) return;

      const { row, col } = activeCell;
      let newRow = row;
      let newCol = col;
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          if (!editEnabled) {
            newRow = Math.max(0, row - 1);
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (!editEnabled) {
            newRow = Math.min(rowCount - 1, row + 1);
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (!editEnabled) {
            newCol = Math.max(0, col - 1);
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (!editEnabled) {
            newCol = Math.min(colCount - 1, col + 1);
            handled = true;
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (col > 0) newCol = col - 1;
            else if (row > 0) {
              newRow = row - 1;
              newCol = colCount - 1;
            }
          } else {
            if (col < colCount - 1) newCol = col + 1;
            else if (row < rowCount - 1) {
              newRow = row + 1;
              newCol = 0;
            }
          }
          handled = true;
          break;
        case 'Enter':
          if (editEnabled) {
            setEditEnabled(false);
            newRow = Math.min(rowCount - 1, row + 1);
          } else {
            setEditEnabled(true);
          }
          handled = true;
          break;
        case 'Escape':
          setEditEnabled(false);
          handled = true;
          break;
      }

      if (handled) {
        if (newRow !== row || newCol !== col) {
          setActiveCell({ row: newRow, col: newCol });
          if (e.shiftKey && !editEnabled) {
            setSelectedRange((prev) => ({
              start: prev.start.row === null ? { row, col } : prev.start,
              end: { row: newRow, col: newCol },
            }));
          } else {
            setSelectedRange({
              start: { row: null, col: null },
              end: { row: null, col: null },
            });
          }
          onCellChange?.(newRow, newCol);
        }
        if (e.key !== 'Tab') e.preventDefault();
      }
    },
    [activeCell, editEnabled, rowCount, colCount, onCellChange],
  );

  // 鼠标选择
  const handleMouseDown = useCallback(
    (row: number, col: number, shiftKey: boolean) => {
      setIsMouseDown(true);
      setEditEnabled(false);
      if (shiftKey && activeCellRef.current.row !== null) {
        setSelectedRange({ start: activeCellRef.current, end: { row, col } });
      } else {
        setActiveCell({ row, col });
        setSelectedRange({ start: { row, col }, end: { row, col } });
      }
    },
    [],
  );

  const handleMouseOver = useCallback(
    (row: number, col: number) => {
      if (isMouseDown) {
        setSelectedRange((prev) => ({ ...prev, end: { row, col } }));
      }
    },
    [isMouseDown],
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // 注册全局事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleMouseUp]);

  return {
    activeCell,
    setActiveCell,
    selectedRange,
    setSelectedRange,
    editEnabled,
    setEditEnabled,
    isInRange,
    handleMouseDown,
    handleMouseOver,
  };
}

/**
 * useColumnResize - 列宽调整
 */
export function useColumnResize(
  onResize: (colId: string, width: number) => void,
) {
  const [resizing, setResizing] = useState<{
    colId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const startResize = useCallback(
    (colId: string, startX: number, startWidth: number) => {
      setResizing({ colId, startX, startWidth });
    },
    [],
  );

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(60, Math.min(500, resizing.startWidth + delta));
      onResize(resizing.colId, newWidth);
    };

    const handleMouseUp = () => setResizing(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, onResize]);

  return { resizing, startResize };
}

/**
 * useProcessedRows - 筛选、排序、分组处理管道
 */
export function useProcessedRows(
  rows: Row[],
  columns: Column[],
  filters: FilterCondition[],
  sorts: SortConfig[],
  groupConfig: GroupConfig,
): { groupedRows: GroupedRows; totalFiltered: number } {
  return useMemo(() => {
    let result = [...rows];

    // 1. 应用筛选
    if (filters.length > 0) {
      result = result.filter((row) =>
        filters.every((f) => applyFilter(row, f, columns)),
      );
    }

    // 2. 应用排序
    if (sorts.length > 0) {
      result.sort((a, b) => applySorting(a, b, sorts, columns));
    }

    const totalFiltered = result.length;

    // 3. 应用分组
    if (groupConfig.fieldId) {
      return {
        groupedRows: groupRows(result, groupConfig),
        totalFiltered,
      };
    }

    return { groupedRows: { __all__: result }, totalFiltered };
  }, [rows, columns, filters, sorts, groupConfig]);
}
