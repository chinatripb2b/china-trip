// 多维表格类型定义（原模块缺失，内联定义）
interface ColumnOption {
  id: string;
  title: string;
  color: string;
}

interface ColumnMeta {
  options?: ColumnOption[];
}

interface Column {
  id: string;
  title: string;
  uidt: string;
  width: number;
  show: boolean;
  meta?: ColumnMeta;
}

interface RowMeta {
  selected: boolean;
  saving: boolean;
  changed: boolean;
}

interface Row {
  id: number;
  rowData: Record<string, unknown>;
  rowMeta: RowMeta;
}

// Mock 数据
export const createMockData = (): { columns: Column[]; rows: Row[] } => {
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
          { id: 'todo', title: '待办', color: '#6B7280' },
          { id: 'doing', title: '进行中', color: '#3B82F6' },
          { id: 'done', title: '已完成', color: '#22C55E' },
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
          { id: 'high', title: '高', color: '#EF4444' },
          { id: 'medium', title: '中', color: '#F59E0B' },
          { id: 'low', title: '低', color: '#22C55E' },
        ],
      },
    },
    { id: 'dueDate', title: '截止日期', uidt: 'Date', width: 120, show: true },
    { id: 'progress', title: '进度', uidt: 'Number', width: 80, show: true },
    { id: 'completed', title: '完成', uidt: 'Checkbox', width: 70, show: true },
    {
      id: 'tags',
      title: '标签',
      uidt: 'MultiSelect',
      width: 180,
      show: true,
      meta: {
        options: [
          { id: 'frontend', title: '前端', color: '#3B82F6' },
          { id: 'backend', title: '后端', color: '#22C55E' },
          { id: 'design', title: '设计', color: '#8B5CF6' },
        ],
      },
    },
    {
      id: 'description',
      title: '描述',
      uidt: 'LongText',
      width: 200,
      show: true,
    },
  ];

  const rows: Row[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    rowData: {
      title: `任务 ${i + 1}`,
      status: ['todo', 'doing', 'done'][i % 3],
      priority: ['high', 'medium', 'low'][i % 3],
      dueDate: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
      progress: (i * 10) % 110,
      completed: i % 4 === 0,
      tags: i % 2 === 0 ? 'frontend,design' : 'backend',
      description: `这是任务 ${i + 1} 的描述信息`,
    },
    rowMeta: { selected: false, saving: false, changed: false },
  }));

  return { columns, rows };
};
