import type {
  Column,
  FilterCondition,
  FilterOperator,
  GroupConfig,
  GroupedRows,
  Row,
  SortConfig,
  UITypes,
} from '@/components/types';

// ==================== 工具函数 ====================

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getOperatorsForType = (uidt: UITypes): FilterOperator[] => {
  switch (uidt) {
    case 'Number':
    case 'Decimal':
      return [
        'equals',
        'notEquals',
        'gt',
        'lt',
        'gte',
        'lte',
        'isEmpty',
        'isNotEmpty',
      ];
    case 'Checkbox':
      return ['equals', 'notEquals'];
    case 'SingleSelect':
    case 'MultiSelect':
      return ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'];
    case 'Date':
    case 'DateTime':
      return [
        'equals',
        'notEquals',
        'gt',
        'lt',
        'gte',
        'lte',
        'isEmpty',
        'isNotEmpty',
      ];
    default:
      return [
        'equals',
        'notEquals',
        'contains',
        'notContains',
        'isEmpty',
        'isNotEmpty',
      ];
  }
};

export const getOperatorLabel = (op: FilterOperator): string => {
  const labels: Record<FilterOperator, string> = {
    equals: '等于',
    notEquals: '不等于',
    contains: '包含',
    notContains: '不包含',
    isEmpty: '为空',
    isNotEmpty: '不为空',
    gt: '大于',
    lt: '小于',
    gte: '大于等于',
    lte: '小于等于',
  };
  return labels[op];
};

export const isGroupableField = (uidt: UITypes): boolean => {
  return ['SingleSelect', 'Checkbox', 'MultiSelect'].includes(uidt);
};

// 应用单个筛选条件
export function applyFilter(
  row: Row,
  filter: FilterCondition,
  columns: Column[],
): boolean {
  const column = columns.find((c) => c.id === filter.fieldId);
  if (!column) return true;

  const value = row.rowData[filter.fieldId];
  const filterValue = filter.value;

  switch (filter.operator) {
    case 'equals':
      if (column.uidt === 'Checkbox') {
        return Boolean(value) === Boolean(filterValue);
      }
      return String(value ?? '') === String(filterValue ?? '');
    case 'notEquals':
      if (column.uidt === 'Checkbox') {
        return Boolean(value) !== Boolean(filterValue);
      }
      return String(value ?? '') !== String(filterValue ?? '');
    case 'contains':
      return String(value ?? '')
        .toLowerCase()
        .includes(String(filterValue ?? '').toLowerCase());
    case 'notContains':
      return !String(value ?? '')
        .toLowerCase()
        .includes(String(filterValue ?? '').toLowerCase());
    case 'isEmpty':
      return value === null || value === undefined || value === '';
    case 'isNotEmpty':
      return value !== null && value !== undefined && value !== '';
    case 'gt':
      return Number(value) > Number(filterValue);
    case 'lt':
      return Number(value) < Number(filterValue);
    case 'gte':
      return Number(value) >= Number(filterValue);
    case 'lte':
      return Number(value) <= Number(filterValue);
    default:
      return true;
  }
}

// 应用排序
export function applySorting(
  a: Row,
  b: Row,
  sorts: SortConfig[],
  columns: Column[],
): number {
  for (const sort of sorts) {
    const column = columns.find((c) => c.id === sort.fieldId);
    if (!column) continue;

    const aVal = a.rowData[sort.fieldId];
    const bVal = b.rowData[sort.fieldId];

    let comparison = 0;

    // 处理空值
    if (aVal == null && bVal == null) continue;
    if (aVal == null) return sort.direction === 'asc' ? 1 : -1;
    if (bVal == null) return sort.direction === 'asc' ? -1 : 1;

    // 根据类型比较
    if (['Number', 'Decimal'].includes(column.uidt)) {
      comparison = Number(aVal) - Number(bVal);
    } else if (['Date', 'DateTime'].includes(column.uidt)) {
      comparison =
        new Date(String(aVal)).getTime() - new Date(String(bVal)).getTime();
    } else if (column.uidt === 'Checkbox') {
      comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
    } else {
      comparison = String(aVal).localeCompare(String(bVal), 'zh-CN');
    }

    if (comparison !== 0) {
      return sort.direction === 'asc' ? comparison : -comparison;
    }
  }
  return 0;
}

// 分组行
export function groupRows(
  rows: Row[],
  groupConfig: GroupConfig,
  columns: Column[],
): GroupedRows {
  if (!groupConfig.fieldId) return { __all__: rows };

  const column = columns.find((c) => c.id === groupConfig.fieldId);
  if (!column) return { __all__: rows };

  const groups: GroupedRows = {};

  rows.forEach((row) => {
    let groupKey = row.rowData[groupConfig.fieldId!];

    // 处理空值
    if (groupKey === null || groupKey === undefined || groupKey === '') {
      groupKey = '__empty__';
    } else if (column.uidt === 'Checkbox') {
      groupKey = groupKey ? '__checked__' : '__unchecked__';
    } else {
      groupKey = String(groupKey);
    }

    const key = groupKey as string;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key]!.push(row);
  });

  return groups;
}

// 获取分组显示标签
export function getGroupLabel(groupKey: string, column: Column): string {
  if (groupKey === '__all__') return '所有记录';
  if (groupKey === '__empty__') return '(空)';
  if (groupKey === '__checked__') return '已选中';
  if (groupKey === '__unchecked__') return '未选中';

  // 对于 SingleSelect，尝试获取选项标题
  if (column.uidt === 'SingleSelect' && column.meta?.options) {
    const option = column.meta.options.find(
      (o) => o.id === groupKey || o.title === groupKey,
    );
    if (option) return option.title;
  }

  return groupKey;
}

// 获取分组标签的颜色样式
export function getGroupLabelStyle(
  groupKey: string,
  column: Column,
): { bg: string; text: string } {
  if (groupKey === '__empty__')
    return { bg: 'bg-gray-100', text: 'text-gray-600' };
  if (groupKey === '__checked__')
    return { bg: 'bg-green-100', text: 'text-green-700' };
  if (groupKey === '__unchecked__')
    return { bg: 'bg-gray-100', text: 'text-gray-600' };

  // 对于 SingleSelect，使用选项的颜色
  if (column.uidt === 'SingleSelect' && column.meta?.options) {
    const option = column.meta.options.find(
      (o) => o.id === groupKey || o.title === groupKey,
    );
    if (option) {
      const colorMap: Record<string, { bg: string; text: string }> = {
        '#EF4444': { bg: 'bg-red-100', text: 'text-red-700' },
        '#F59E0B': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        '#22C55E': { bg: 'bg-green-100', text: 'text-green-700' },
        '#3B82F6': { bg: 'bg-blue-100', text: 'text-blue-700' },
        '#8B5CF6': { bg: 'bg-purple-100', text: 'text-purple-700' },
        '#6B7280': { bg: 'bg-gray-100', text: 'text-gray-700' },
      };
      return (
        colorMap[option.color] || { bg: 'bg-gray-100', text: 'text-gray-700' }
      );
    }
  }

  return { bg: 'bg-gray-100', text: 'text-gray-700' };
}
