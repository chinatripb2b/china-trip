'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useColumnResize,
  useMultiSelect,
  useProcessedRows,
} from '@/components/hooks';
import {
  AddFieldDialog,
  ColumnSettingsPanel,
  FilterPanel,
  GroupPanel,
  HeaderCell,
  SortPanel,
} from '@/components/panels';
import { SmartCell } from '@/components/smart-cell';
import {
  GridContext,
  type Column,
  type FilterCondition,
  type GridContextType,
  type GroupConfig,
  type Row,
  type SelectOption,
  type SortConfig,
  type UITypes,
} from '@/components/types';
import { Button } from '@/components/ui/button';

// ==================== 工具函数 ====================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getGroupLabel(groupKey: string, column: Column): string {
  if (groupKey === '__empty__') {
    return '未分组';
  }
  if (
    (column.uidt === 'SingleSelect' || column.uidt === 'MultiSelect') &&
    column.meta?.options
  ) {
    const option = column.meta.options.find((opt) => opt.id === groupKey);
    return option?.title ?? groupKey;
  }
  return groupKey;
}

function getGroupLabelStyle(groupKey: string, column: Column): { bg: string; text: string } {
  if (
    (column.uidt === 'SingleSelect' || column.uidt === 'MultiSelect') &&
    column.meta?.options
  ) {
    const option = column.meta.options.find((opt) => opt.id === groupKey);
    if (option?.color) {
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  }
  return { bg: 'bg-gray-100', text: 'text-gray-700' };
}

// ==================== Mock Data ====================

function createMockData(): { columns: Column[]; rows: Row[] } {
  const columns: Column[] = [
    {
      id: 'title',
      title: '任务名称',
      uidt: 'SingleLineText',
      width: 200,
      show: true,
    },
    {
      id: 'status',
      title: '状态',
      uidt: 'SingleSelect',
      width: 120,
      show: true,
      meta: {
        options: [
          { id: 'todo', title: '待办', color: 'gray' },
          { id: 'doing', title: '进行中', color: 'blue' },
          { id: 'done', title: '已完成', color: 'green' },
        ],
      },
    },
    {
      id: 'priority',
      title: '优先级',
      uidt: 'SingleSelect',
      width: 100,
      show: true,
      meta: {
        options: [
          { id: 'low', title: '低', color: 'gray' },
          { id: 'medium', title: '中', color: 'yellow' },
          { id: 'high', title: '高', color: 'red' },
        ],
      },
    },
    { id: 'dueDate', title: '截止日期', uidt: 'Date', width: 120, show: true },
    { id: 'progress', title: '进度', uidt: 'Number', width: 150, show: true },
    { id: 'completed', title: '已完成', uidt: 'Checkbox', width: 80, show: true },
    { id: 'tags', title: '标签', uidt: 'SingleLineText', width: 150, show: true },
    { id: 'description', title: '描述', uidt: 'LongText', width: 250, show: false },
  ];

  const rows: Row[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    rowData: {
      title: `任务 ${i + 1}`,
      status: ['todo', 'doing', 'done'][i % 3],
      priority: ['low', 'medium', 'high'][i % 3],
      dueDate: new Date(Date.now() + (i - 10) * 86400000)
        .toISOString()
        .split('T')[0],
      progress: Math.floor(Math.random() * 100),
      completed: i % 3 === 2,
      tags: `标签${i % 5}`,
      description: `这是任务 ${i + 1} 的描述`,
    },
    rowMeta: { selected: false, saving: false, changed: false },
  }));

  return { columns, rows };
}
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  Plus,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';

// ==================== 主表格组件 ====================

const MultidimensionalTable: React.FC = () => {
  const [{ columns, rows }, setData] = useState(createMockData);

  // 筛选、排序、分组状态
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sorts, setSorts] = useState<SortConfig[]>([]);
  const [groupConfig, setGroupConfig] = useState<GroupConfig>({
    fieldId: null,
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // 分组折叠状态
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // 表格容器 ref（用于滚动）
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 标记是否刚添加了新行
  const justAddedRowRef = useRef(false);

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.show),
    [columns],
  );

  // 处理后的数据（筛选、排序、分组）
  const { groupedRows, totalFiltered } = useProcessedRows(
    rows,
    visibleColumns,
    filters,
    sorts,
    groupConfig,
  );

  // 计算渲染用的平铺行列表（用于键盘导航）
  const flatRows = useMemo(() => {
    const typedGroupedRows = groupedRows as unknown as Record<string, Row[]>;
    if (groupConfig.fieldId === null) {
      return typedGroupedRows['__all__'] || [];
    }
    const result: typeof rows = [];
    Object.entries(typedGroupedRows).forEach(([groupKey, groupRowsData]) => {
      if (!collapsedGroups.has(groupKey)) {
        result.push(...groupRowsData);
      }
    });
    return result;
  }, [groupedRows, groupConfig.fieldId, collapsedGroups]);

  // 多选/导航
  const multiSelect = useMultiSelect(flatRows.length, visibleColumns.length);

  // 列宽调整
  const { startResize } = useColumnResize((colId, width) => {
    setData((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === colId ? { ...c, width } : c)),
    }));
  });

  // 更新单元格 - 需要在原始 rows 中更新
  const updateCell = useCallback(
    (rowIndex: number, colId: string, value: unknown) => {
      const targetRow = flatRows[rowIndex];
      if (!targetRow) return;

      setData((prev) => ({
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === targetRow.id
            ? {
                ...r,
                rowData: { ...r.rowData, [colId]: value },
                rowMeta: { ...r.rowMeta, changed: true },
              }
            : r,
        ),
      }));
    },
    [flatRows],
  );

  // 删除行
  const deleteRow = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== id),
    }));
  }, []);

  // 添加行
  const addRow = useCallback(() => {
    justAddedRowRef.current = true;
    setData((prev) => {
      const newId = prev.rows.length + 1;
      return {
        ...prev,
        rows: [
          ...prev.rows,
          {
            id: Date.now(),
            rowData: {
              title: `新任务 ${newId}`,
              status: 'todo',
              priority: 'medium',
              dueDate: new Date().toISOString().split('T')[0],
              progress: 0,
              completed: false,
              tags: '',
              description: '',
            },
            rowMeta: { selected: false, saving: false, changed: true },
          },
        ],
      };
    });
  }, []);

  // 添加行后自动滚动和聚焦
  useEffect(() => {
    if (justAddedRowRef.current && flatRows.length > 0) {
      justAddedRowRef.current = false;

      // 延迟执行（等待 DOM 更新）
      setTimeout(() => {
        // 滚动到底部
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop =
            tableContainerRef.current.scrollHeight;
        }
        // 聚焦到新行
        const newRowIndex = flatRows.length - 1;
        multiSelect.setActiveCell({ row: newRowIndex, col: 0 });
        multiSelect.setEditEnabled(true);
      }, 50);
    }
  }, [flatRows.length, multiSelect]);

  // 添加字段
  const addField = useCallback(
    (field: { title: string; uidt: UITypes; options?: SelectOption[] }) => {
      setData((prev) => {
        const newColumn: Column = {
          id: generateId(),
          title: field.title,
          uidt: field.uidt,
          width: 120,
          show: true,
          meta: field.options ? { options: field.options } : undefined,
        };
        return {
          ...prev,
          columns: [...prev.columns, newColumn],
        };
      });
    },
    [],
  );

  // 更新列配置（显隐、顺序）
  const updateColumns = useCallback((newColumns: Column[]) => {
    setData((prev) => ({
      ...prev,
      columns: newColumns,
    }));
  }, []);

  // 切换分组折叠
  const toggleGroupCollapse = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  // 获取分组的列
  const groupColumn = useMemo(() => {
    if (!groupConfig.fieldId) return null;
    return visibleColumns.find((c) => c.id === groupConfig.fieldId) || null;
  }, [groupConfig.fieldId, visibleColumns]);

  // Context 值 - 使用 useMemo 避免不必要的重渲染
  const contextValue: GridContextType = useMemo(
    () => ({
      columns: visibleColumns,
      rows: flatRows,
      activeCell: multiSelect.activeCell,
      selectedRange: multiSelect.selectedRange,
      editEnabled: multiSelect.editEnabled,
      setActiveCell: multiSelect.setActiveCell,
      setSelectedRange: multiSelect.setSelectedRange,
      setEditEnabled: multiSelect.setEditEnabled,
      updateCell,
      isInRange: multiSelect.isInRange,
      handleMouseDown: (row, col) => multiSelect.handleMouseDown(row, col, false),
      handleMouseOver: multiSelect.handleMouseOver,
    }),
    [
      visibleColumns,
      flatRows,
      multiSelect.activeCell,
      multiSelect.selectedRange,
      multiSelect.editEnabled,
      multiSelect.setActiveCell,
      multiSelect.setSelectedRange,
      multiSelect.setEditEnabled,
      updateCell,
      multiSelect.isInRange,
      multiSelect.handleMouseDown,
      multiSelect.handleMouseOver,
    ],
  );

  // 渲染普通表格行（无分组时使用）
  const renderTableRows = () => {
    return flatRows.map((row, rowIdx) => (
      <tr key={row.id} className="group hover:bg-gray-50/50">
        <td className="sticky left-0 z-20 h-8 w-12 border-r border-b border-gray-200 bg-white px-2 text-center text-xs text-gray-400 group-hover:bg-gray-50">
          <div className="flex items-center justify-center gap-1">
            <span className="group-hover:hidden">{rowIdx + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteRow(row.id)}
              className="hidden h-5 w-5 text-red-500 group-hover:flex hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </td>
        {visibleColumns.map((col, colIdx) => (
          <SmartCell
            key={col.id}
            column={col}
            value={row.rowData[col.id]}
            rowIndex={rowIdx}
            colIndex={colIdx}
          />
        ))}
        <td className="w-10 border-b border-gray-200"></td>
      </tr>
    ));
  };

  // 渲染分组视图（卡片样式）
  const renderGroupedView = () => {
    let globalRowIdx = 0;
    const typedGroupedRows = groupedRows as unknown as Record<string, Row[]>;

    return (
      <div className="space-y-4 p-4">
        {Object.entries(typedGroupedRows).map(([groupKey, groupRowsData]) => {
          const isCollapsed = collapsedGroups.has(groupKey);
          const groupLabel = groupColumn
            ? getGroupLabel(groupKey, groupColumn)
            : groupKey;
          const labelStyle = groupColumn
            ? getGroupLabelStyle(groupKey, groupColumn)
            : { bg: 'bg-gray-100', text: 'text-gray-700' };
          const startRowIdx = globalRowIdx;
          const groupRowsArray = groupRowsData as Row[];

          if (!isCollapsed) {
            globalRowIdx += groupRowsArray.length;
          }

          return (
            <div
              key={groupKey}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {/* 分组头 */}
              <div
                className="flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-white px-4 py-2.5 select-none hover:bg-gray-50"
                onClick={() => toggleGroupCollapse(groupKey)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                )}
                <span
                  className={`rounded px-2 py-0.5 text-sm font-medium ${labelStyle.bg} ${labelStyle.text}`}
                >
                  {groupLabel}
                </span>
                <span className="text-sm text-gray-500">
                  {groupRowsArray.length} 条记录
                </span>
              </div>

              {/* 分组内容 */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    {/* 分组内表头 */}
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 z-20 h-9 w-12 border-r border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                          #
                        </th>
                        {visibleColumns.map((col) => (
                          <HeaderCell
                            key={col.id}
                            column={col}
                            colIndex={0}
                            onResize={startResize}
                          />
                        ))}
                  <th className="h-9 w-10 border-b border-gray-200 bg-gray-50"></th>
                </tr>
              </thead>

              {/* 分组内数据行 */}
                    <tbody>
                      {groupRowsArray.map((row, localIdx) => {
                        const rowIdx = startRowIdx + localIdx;
                        return (
                          <tr
                            key={row.id}
                            className="group hover:bg-gray-50/50"
                          >
                            <td className="sticky left-0 z-20 h-8 w-12 border-r border-b border-gray-200 bg-white px-2 text-center text-xs text-gray-400 group-hover:bg-gray-50">
                              <div className="flex items-center justify-center gap-1">
                                <span className="group-hover:hidden">
                                  {rowIdx + 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteRow(row.id)}
                                  className="hidden h-5 w-5 text-red-500 group-hover:flex hover:bg-red-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            {visibleColumns.map((col, colIdx) => (
                              <SmartCell
                                key={col.id}
                                column={col}
                                value={row.rowData[col.id]}
                                rowIndex={rowIdx}
                                colIndex={colIdx}
                              />
                            ))}
                            <td className="w-10 border-b border-gray-200"></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col rounded-lg bg-white shadow-sm">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">
            多维表风格的表格
          </h1>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {totalFiltered === rows.length
              ? `${rows.length} 条记录`
              : `${totalFiltered} / ${rows.length} 条记录`}
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-0.5">
          {/* 筛选按钮 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterPanel(!showFilterPanel);
                setShowSortPanel(false);
                setShowGroupPanel(false);
                setShowColumnSettings(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.length > 0
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              {filters.length > 0 ? `${filters.length} 筛选` : '筛选'}
            </button>
            {showFilterPanel && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFilterPanel(false)}
                />
                <FilterPanel
                  filters={filters as FilterCondition[]}
                  setFilters={
                    setFilters as React.Dispatch<
                      React.SetStateAction<FilterCondition[]>
                    >
                  }
                  columns={visibleColumns}
                  onClose={() => setShowFilterPanel(false)}
                />
              </>
            )}
          </div>

          {/* 分组按钮 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowGroupPanel(!showGroupPanel);
                setShowFilterPanel(false);
                setShowSortPanel(false);
                setShowColumnSettings(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                groupConfig.fieldId
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <Layers className="h-4 w-4" />
              {groupConfig.fieldId ? `1 分组` : '分组'}
            </button>
            {showGroupPanel && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowGroupPanel(false)}
                />
                <GroupPanel
                  groupConfig={groupConfig}
                  setGroupConfig={setGroupConfig}
                  columns={visibleColumns}
                  onClose={() => setShowGroupPanel(false)}
                />
              </>
            )}
          </div>

          {/* 排序按钮 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortPanel(!showSortPanel);
                setShowFilterPanel(false);
                setShowGroupPanel(false);
                setShowColumnSettings(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sorts.length > 0
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <ArrowUpDown className="h-4 w-4" />
              {sorts.length > 0 ? `${sorts.length} 排序` : '排序'}
            </button>
            {showSortPanel && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortPanel(false)}
                />
                <SortPanel
                  sorts={sorts}
                  setSorts={setSorts}
                  columns={visibleColumns}
                  onClose={() => setShowSortPanel(false)}
                />
              </>
            )}
          </div>

          <div className="mx-2 h-5 w-px bg-gray-200" />

          {/* 表头设置按钮 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColumnSettings(!showColumnSettings);
                setShowFilterPanel(false);
                setShowSortPanel(false);
                setShowGroupPanel(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <Settings2 className="h-4 w-4" />
              表头
            </button>
            {showColumnSettings && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColumnSettings(false)}
                />
                <ColumnSettingsPanel
                  columns={columns}
                  onColumnsChange={updateColumns}
                  onClose={() => setShowColumnSettings(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 活动条件提示 */}
      {(filters.length > 0 || sorts.length > 0 || groupConfig.fieldId) && (
        <div className="flex items-center gap-4 border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {filters.length > 0 && (
            <span className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              {filters.length} 个筛选条件
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFilters([])}
                className="ml-1 h-5 w-5 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}
          {sorts.length > 0 && (
            <span className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sorts.length} 个排序规则
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSorts([])}
                className="ml-1 h-5 w-5 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}
          {groupConfig.fieldId && (
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />按 {groupColumn?.title} 分组
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGroupConfig({ fieldId: null })}
                className="ml-1 h-5 w-5 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}
        </div>
      )}

      {/* 表格容器 */}
      <GridContext.Provider value={contextValue}>
        <div
          ref={tableContainerRef}
          className={`relative flex-1 overflow-auto ${groupConfig.fieldId ? 'bg-gray-100' : 'border-b border-gray-200'}`}
        >
          {totalFiltered === 0 ? (
            <div className="flex h-full flex-col items-center justify-center bg-white text-gray-500">
              <Filter className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-lg">没有匹配的记录</p>
              <p className="mt-1 text-sm">尝试调整筛选条件</p>
              {filters.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setFilters([])}
                  className="mt-3 text-blue-600 hover:bg-blue-50"
                >
                  清除所有筛选
                </Button>
              )}
            </div>
          ) : groupConfig.fieldId ? (
            // 分组视图：卡片样式
            renderGroupedView()
          ) : (
            // 普通视图：单个表格
            <table className="w-full border-collapse">
              {/* 表头 */}
              <thead className="sticky top-0 z-30 bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-40 h-9 w-12 border-r border-b border-gray-200 bg-gray-100 text-xs text-gray-500">
                    #
                  </th>
                  {visibleColumns.map((col, idx) => (
                    <HeaderCell
                      key={col.id}
                      column={col}
                      colIndex={idx}
                      onResize={startResize}
                    />
                  ))}
                  <th className="h-9 w-10 border-b border-gray-200 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddField(true)}
                      className="h-full w-full text-gray-400 hover:text-gray-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </th>
                </tr>
              </thead>

              {/* 表体 */}
              <tbody>{renderTableRows()}</tbody>
            </table>
          )}
        </div>
      </GridContext.Provider>

      {/* 添加行 */}
      <div className="border-t border-gray-200 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="text-gray-500 hover:text-gray-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          添加记录
        </Button>
      </div>

      {/* 状态栏 */}
      <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <span>
          {multiSelect.activeCell.row !== null &&
          multiSelect.activeCell.col !== null
            ? `选中: 行 ${multiSelect.activeCell.row + 1}, 列 ${visibleColumns[multiSelect.activeCell.col]?.title}`
            : '点击单元格开始操作'}
        </span>
        <span>
          {totalFiltered === rows.length
            ? `共 ${rows.length} 条记录`
            : `显示 ${totalFiltered} / ${rows.length} 条记录`}
        </span>
      </div>

      {/* 添加字段弹窗 */}
      {showAddField && (
        <AddFieldDialog
          onAdd={addField}
          onClose={() => setShowAddField(false)}
        />
      )}
    </div>
  );
};

export default MultidimensionalTable;
