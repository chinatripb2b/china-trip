'use client';

import React, { memo, useState } from 'react';
import type {
  Column,
  GroupConfig,
  SelectOption,
  SortConfig,
  UITypes,
} from '@/components/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Hash,
  List,
  Plus,
  Type,
  X,
} from 'lucide-react';

// ==================== 类型定义 ====================

type PanelFilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

type FilterValue = string | boolean | number | null;

export type FilterCondition = import('@/components/types').FilterCondition;

// ==================== 工具函数 ====================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getOperatorsForType(uidt: UITypes): PanelFilterOperator[] {
  switch (uidt) {
    case 'SingleLineText':
    case 'LongText':
    case 'Email':
    case 'URL':
      return [
        'equals',
        'notEquals',
        'contains',
        'notContains',
        'isEmpty',
        'isNotEmpty',
      ];
    case 'Number':
    case 'Decimal':
      return [
        'equals',
        'notEquals',
        'gt',
        'gte',
        'lt',
        'lte',
        'isEmpty',
        'isNotEmpty',
      ];
    case 'Date':
    case 'DateTime':
      return [
        'equals',
        'notEquals',
        'gt',
        'gte',
        'lt',
        'lte',
        'isEmpty',
        'isNotEmpty',
      ];
    case 'Checkbox':
      return ['equals', 'notEquals'];
    case 'SingleSelect':
    case 'MultiSelect':
      return ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'];
    default:
      return ['equals', 'notEquals'];
  }
}

function getOperatorLabel(operator: PanelFilterOperator): string {
  const labels: Record<PanelFilterOperator, string> = {
    equals: '等于',
    notEquals: '不等于',
    contains: '包含',
    notContains: '不包含',
    isEmpty: '为空',
    isNotEmpty: '不为空',
    gt: '大于',
    gte: '大于等于',
    lt: '小于',
    lte: '小于等于',
  };
  return labels[operator] || operator;
}

function isGroupableField(uidt: UITypes): boolean {
  return ['SingleSelect', 'MultiSelect', 'Checkbox', 'Date', 'DateTime'].includes(uidt);
}

// ==================== 表头组件 ====================

interface HeaderCellProps {
  column: Column;
  colIndex: number;
  onResize: (colId: string, startX: number, width: number) => void;
}

export const HeaderCell = memo<HeaderCellProps>(({ column, onResize }) => {
  const getIcon = (uidt: UITypes) => {
    switch (uidt) {
      case 'SingleLineText':
      case 'LongText':
      case 'Email':
      case 'URL':
        return <Type className="h-3.5 w-3.5" />;
      case 'Number':
      case 'Decimal':
        return <Hash className="h-3.5 w-3.5" />;
      case 'Date':
      case 'DateTime':
        return <CalendarIcon className="h-3.5 w-3.5" />;
      case 'Checkbox':
        return <CheckSquare className="h-3.5 w-3.5" />;
      case 'SingleSelect':
      case 'MultiSelect':
        return <List className="h-3.5 w-3.5" />;
      default:
        return <Type className="h-3.5 w-3.5" />;
    }
  };

  return (
    <th
      className="group relative h-9 border-r border-b border-gray-200 bg-gray-50 px-2 text-left font-medium text-gray-700 select-none"
      style={{ width: column.width, minWidth: column.width }}
    >
      <div className="flex items-center gap-1.5 pr-2">
        <span className="text-gray-400">{getIcon(column.uidt)}</span>
        <span className="truncate text-sm">{column.title}</span>
      </div>
      {/* 列宽调整手柄 */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-500"
        onMouseDown={(e) => {
          e.preventDefault();
          onResize(column.id, e.clientX, column.width);
        }}
      />
    </th>
  );
});

HeaderCell.displayName = 'HeaderCell';

// ==================== 操作面板组件 ====================

interface FilterPanelProps {
  filters: FilterCondition[];
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
  columns: Column[];
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  columns,
  onClose,
}) => {
  const addFilter = () => {
    const firstColumn = columns[0];
    if (!firstColumn) return;
    const operators = getOperatorsForType(firstColumn.uidt);
    const firstOperator = operators[0];
    if (!firstOperator) return;
    setFilters((prev) => [
      ...prev,
      {
        id: generateId(),
        fieldId: firstColumn.id,
      operator: firstOperator,
      value: '' as FilterValue,

      },
    ]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFieldChange = (filterId: string, fieldId: string) => {
    const column = columns.find((c) => c.id === fieldId);
    if (!column) return;
    updateFilter(filterId, {
      fieldId,
      operator: getOperatorsForType(column.uidt)[0],
      value: '' as FilterValue,
    });
  };

  return (
    <div className="absolute top-full right-0 z-50 mt-1 w-[420px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-gray-700">筛选条件</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      {filters.length === 0 ? (
        <div className="py-2 text-sm text-gray-500">暂无筛选条件</div>
      ) : (
        <div className="mb-3 space-y-2">
          {filters.map((filter, idx) => {
            const column = columns.find((c) => c.id === filter.fieldId);
            const operators = column ? getOperatorsForType(column.uidt) : [];
            const needsValue = !['isEmpty', 'isNotEmpty'].includes(
              filter.operator,
            );

            return (
              <div key={filter.id} className="flex items-center gap-2">
                {idx > 0 && (
                  <span className="w-8 text-xs text-gray-400">且</span>
                )}
                {idx === 0 && (
                  <span className="w-8 text-xs text-gray-400">当</span>
                )}

                <Select
                  value={filter.fieldId}
                  onValueChange={(v) => handleFieldChange(filter.id, v)}
                >
                  <SelectTrigger className="h-8 flex-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(v) =>
                    updateFilter(filter.id, {
                      operator: v as FilterCondition['operator'],
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-24 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op} value={op}>
                        {getOperatorLabel(op)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {needsValue &&
                column?.uidt === 'SingleSelect' &&
                column.meta?.options ? (
                  <Select
                    value={String(filter.value || '__empty__')}
                    onValueChange={(v) =>
                       updateFilter(filter.id, {
                         value: (v === '__empty__' ? '' : v) as FilterValue,
                       })

                    }
                  >
                    <SelectTrigger className="h-8 flex-1 text-sm">
                      <SelectValue placeholder="选择..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__empty__">选择...</SelectItem>
                      {column.meta.options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : needsValue && column?.uidt === 'Checkbox' ? (
                  <Select
                    value={filter.value ? 'true' : 'false'}
                    onValueChange={(v) =>
                      updateFilter(filter.id, {
                        value: (v === 'true') as FilterValue,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 flex-1 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">已选中</SelectItem>
                      <SelectItem value="false">未选中</SelectItem>
                    </SelectContent>
                  </Select>
                ) : needsValue ? (
                  <Input
                    type={
                      ['Number', 'Decimal'].includes(column?.uidt || '')
                        ? 'number'
                        : 'text'
                    }
                    value={String(filter.value || '')}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        value: e.target.value as FilterValue,
                      })
                    }
                    placeholder="值"
                    className="h-8 flex-1 text-sm"
                  />
                ) : (
                  <div className="flex-1" />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilter(filter.id)}
                  className="h-8 w-8 text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={addFilter}
        className="text-blue-600 hover:bg-blue-50"
      >
        <Plus className="mr-1 h-4 w-4" />
        添加条件
      </Button>
    </div>
  );
};

interface SortPanelProps {
  sorts: SortConfig[];
  setSorts: React.Dispatch<React.SetStateAction<SortConfig[]>>;
  columns: Column[];
  onClose: () => void;
}

export const SortPanel: React.FC<SortPanelProps> = ({
  sorts,
  setSorts,
  columns,
  onClose,
}) => {
  const addSort = () => {
    const availableColumns = columns.filter(
      (c) => !sorts.some((s) => s.fieldId === c.id),
    );
    const firstAvailable = availableColumns[0];
    if (!firstAvailable) return;
    setSorts((prev) => [
      ...prev,
      {
        fieldId: firstAvailable.id,
        direction: 'asc',
      },
    ]);
  };

  const updateSort = (index: number, updates: Partial<SortConfig>) => {
    setSorts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s)),
    );
  };

  const removeSort = (index: number) => {
    setSorts((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSort = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorts.length) return;
    setSorts((prev) => {
      const newSorts = [...prev];
      const [removed] = newSorts.splice(index, 1);
      newSorts.splice(newIndex, 0, removed!);
      return newSorts;
    });
  };

  const usedFieldIds = sorts.map((s) => s.fieldId);

  return (
    <div className="absolute top-full right-0 z-50 mt-1 w-[400px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-gray-700">排序规则</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      {sorts.length === 0 ? (
        <div className="py-2 text-sm text-gray-500">暂无排序规则</div>
      ) : (
        <div className="mb-3 space-y-2">
          {sorts.map((sort, idx) => (
            <div key={idx} className="group flex items-center gap-2">
              {/* 拖动排序 */}
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => moveSort(idx, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                  title="上移"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveSort(idx, 'down')}
                  disabled={idx === sorts.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                  title="下移"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="w-8 flex-shrink-0 text-xs text-gray-400">
                {idx === 0 ? '按' : '再按'}
              </span>

              <Select
                value={sort.fieldId}
                onValueChange={(v) => updateSort(idx, { fieldId: v })}
              >
                <SelectTrigger className="h-8 flex-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns
                    .filter(
                      (c) =>
                        c.id === sort.fieldId || !usedFieldIds.includes(c.id),
                    )
                    .map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                value={sort.direction}
                onValueChange={(v) =>
                  updateSort(idx, { direction: v as 'asc' | 'desc' })
                }
              >
                <SelectTrigger className="h-8 w-24 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">升序 ↑</SelectItem>
                  <SelectItem value="desc">降序 ↓</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => removeSort(idx)}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addSort}
        disabled={sorts.length >= columns.length}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        添加排序
      </button>
    </div>
  );
};

interface GroupPanelProps {
  groupConfig: GroupConfig;
  setGroupConfig: React.Dispatch<React.SetStateAction<GroupConfig>>;
  columns: Column[];
  onClose: () => void;
}

export const GroupPanel: React.FC<GroupPanelProps> = ({
  groupConfig,
  setGroupConfig,
  columns,
  onClose,
}) => {
  const groupableColumns = columns.filter((c) => isGroupableField(c.uidt));

  const handleSelect = (fieldId: string | null) => {
    setGroupConfig({ fieldId });
    onClose();
  };

  return (
    <div className="absolute top-full left-0 z-50 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
      {groupableColumns.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500">没有可分组的字段</div>
      ) : (
        <>
          <div
            className={`flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 ${
              !groupConfig.fieldId
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700'
            }`}
            onClick={() => handleSelect(null)}
          >
            不分组
          </div>
          <div className="my-1 border-t border-gray-100" />
          {groupableColumns.map((col) => (
            <div
              key={col.id}
              className={`flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 ${
                groupConfig.fieldId === col.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700'
              }`}
              onClick={() => handleSelect(col.id)}
            >
              {col.title}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

interface ColumnSettingsPanelProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onClose: () => void;
}

export const ColumnSettingsPanel: React.FC<ColumnSettingsPanelProps> = ({
  columns,
  onColumnsChange,
  onClose: _onClose,
}) => {
  // 切换列显隐
  const toggleColumnVisibility = (colId: string) => {
    const newColumns = columns.map((col) =>
      col.id === colId ? { ...col, show: !col.show } : col,
    );
    // 确保至少有一列可见
    const visibleCount = newColumns.filter((c) => c.show).length;
    if (visibleCount === 0) return;
    onColumnsChange(newColumns);
  };

  // 移动列位置
  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const newColumns = [...columns];
    const [removed] = newColumns.splice(index, 1);
    newColumns.splice(newIndex, 0, removed!);
    onColumnsChange(newColumns);
  };

  const visibleCount = columns.filter((c) => c.show).length;

  return (
    <div className="absolute top-full right-0 z-50 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-sm font-medium text-gray-700">显示字段</span>
        <span className="text-xs text-gray-400">
          {visibleCount}/{columns.length}
        </span>
      </div>
      <div className="max-h-[280px] overflow-y-auto py-1">
        {columns.map((col, index) => (
          <div
            key={col.id}
            className="group mx-1 flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
          >
            {/* 拖动手柄 / 排序 */}
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => moveColumn(index, 'up')}
                disabled={index === 0}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                title="上移"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => moveColumn(index, 'down')}
                disabled={index === columns.length - 1}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                title="下移"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 列名 */}
            <span
              className={`flex-1 truncate text-sm ${col.show ? 'text-gray-700' : 'text-gray-400 line-through'}`}
            >
              {col.title}
            </span>

            {/* 显隐切换 */}
            <button
              onClick={() => toggleColumnVisibility(col.id)}
              className={`rounded-md p-1 transition-colors ${
                col.show
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
              }`}
              title={col.show ? '隐藏列' : '显示列'}
            >
              {col.show ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AddFieldDialogProps {
  onAdd: (field: {
    title: string;
    uidt: UITypes;
    options?: SelectOption[];
  }) => void;
  onClose: () => void;
}

export const AddFieldDialog: React.FC<AddFieldDialogProps> = ({
  onAdd,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [uidt, setUidt] = useState<UITypes>('SingleLineText');

  const fieldTypes: { value: UITypes; label: string }[] = [
    { value: 'SingleLineText', label: '单行文本' },
    { value: 'LongText', label: '多行文本' },
    { value: 'Number', label: '数字' },
    { value: 'Decimal', label: '小数' },
    { value: 'Date', label: '日期' },
    { value: 'DateTime', label: '日期时间' },
    { value: 'Checkbox', label: '复选框' },
    { value: 'SingleSelect', label: '单选' },
    { value: 'MultiSelect', label: '多选' },
    { value: 'Email', label: '邮箱' },
    { value: 'URL', label: '链接' },
  ];

  const handleSubmit = () => {
    if (!title.trim()) return;

    const defaultOptions: SelectOption[] = [
      'SingleSelect',
      'MultiSelect',
    ].includes(uidt)
      ? [
          { id: generateId(), title: '选项1', color: '#3B82F6' },
          { id: generateId(), title: '选项2', color: '#22C55E' },
          { id: generateId(), title: '选项3', color: '#F59E0B' },
        ]
      : [];

    onAdd({
      title: title.trim(),
      uidt,
      options: defaultOptions.length > 0 ? defaultOptions : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>添加字段</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="field-name">字段名称</Label>
            <Input
              id="field-name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入字段名称"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-type">字段类型</Label>
            <Select value={uidt} onValueChange={(v) => setUidt(v as UITypes)}>
              <SelectTrigger id="field-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((ft) => (
                  <SelectItem key={ft.value} value={ft.value}>
                    {ft.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {['SingleSelect', 'MultiSelect'].includes(uidt) && (
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              将自动创建 3 个默认选项，可稍后编辑
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
