export const OPTION_COLORS: Record<string, string> = {
  '#EF4444': 'bg-red-100 text-red-800',
  '#F59E0B': 'bg-yellow-100 text-yellow-800',
  '#22C55E': 'bg-green-100 text-green-800',
  '#3B82F6': 'bg-blue-100 text-blue-800',
  '#8B5CF6': 'bg-purple-100 text-purple-800',
  '#6B7280': 'bg-gray-100 text-gray-800',
};

export const getOptionColor = (color: string) =>
  OPTION_COLORS[color] || 'bg-gray-100 text-gray-800';
