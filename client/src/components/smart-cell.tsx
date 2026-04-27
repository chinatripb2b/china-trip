'use client';

import React, { memo, useEffect, useRef } from 'react';
import { useGrid } from '@/components/hooks';
import { getOptionColor } from '@/components/constants';
import type { GridContextType, Column } from '@/components/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface CellProps {
  column: Column;
  value: unknown;
  rowIndex: number;
  colIndex: number;
}

/**
 * SmartCell - 参考 Cell.vue 的动态单元格渲染
 * 根据 column.uidt 选择对应的 Editor 或 Viewer
 */
const SmartCell = memo<CellProps>(({ column, value, rowIndex, colIndex }) => {
  const {
    activeCell,
    editEnabled,
    setEditEnabled,
    updateCell,
    isInRange,
    handleMouseDown,
    handleMouseOver,
  } = useGrid() as unknown as GridContextType;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  // 记录 mousedown 时单元格是否已经是激活状态
  const wasActiveOnMouseDownRef = useRef(false);

  const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
  const isEditing = isActive && editEnabled;
  const isSelected = isInRange(rowIndex, colIndex);

  // 自动聚焦编辑框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else if (inputRef.current instanceof HTMLTextAreaElement) {
        // 多行文本：光标移到末尾
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [isEditing]);

  const handleChange = (newValue: unknown) => {
    updateCell(rowIndex, column.id, newValue);
  };

  const handleBlur = () => {
    setEditEnabled(false);
  };

  const handleDoubleClick = () => {
    setEditEnabled(true);
  };

  // mousedown 时记录当前激活状态
  const handleCellMouseDown = (_e: React.MouseEvent, shiftKey: boolean) => {
    wasActiveOnMouseDownRef.current = isActive;
    handleMouseDown(rowIndex, colIndex, shiftKey);
  };

  // 单击处理：只有在 mousedown 之前就已激活的单元格才进入编辑
  const handleClick = () => {
    if (wasActiveOnMouseDownRef.current) {
      setEditEnabled(true);
    }
  };

  // 单元格样式
  const cellClass = `
    relative h-8 border-r border-b border-gray-200
    ${isActive ? 'outline outline-2 outline-blue-500 outline-offset-[-2px] z-10' : ''}
    ${isSelected && !isActive ? 'bg-blue-50' : ''}
    ${isEditing ? 'bg-white' : 'hover:bg-gray-50'}
  `;

  // ========== 按类型渲染 (参考 Cell.vue 的 v-if 链) ==========

  // 文本类型
  if (['SingleLineText', 'Email', 'URL'].includes(column.uidt)) {
    if (isEditing) {
      return (
        <td
          className={cellClass}
          style={{ width: column.width, minWidth: column.width }}
        >
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={
              column.uidt === 'Email'
                ? 'email'
                : column.uidt === 'URL'
                  ? 'url'
                  : 'text'
            }
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className="h-full rounded-none border-none shadow-none focus-visible:ring-0"
          />
        </td>
      );
    }
    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => handleCellMouseDown(e, e.shiftKey)}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="truncate px-2 py-1 text-sm">{String(value || '')}</div>
      </td>
    );
  }

  // 长文本
  if (column.uidt === 'LongText') {
    if (isEditing) {
      return (
        <td
          className={cellClass}
          style={{ width: column.width, minWidth: column.width }}
        >
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              // 允许 Enter 换行，Cmd/Ctrl+Enter 退出编辑
              if (e.key === 'Enter') {
                if (e.metaKey || e.ctrlKey) {
                  e.preventDefault();
                  handleBlur();
                } else {
                  e.stopPropagation(); // 阻止全局处理器捕获
                }
              }
            }}
            className="h-full min-h-0 resize-none rounded-none border-none shadow-none focus-visible:ring-0"
            rows={3}
          />
        </td>
      );
    }
    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => handleCellMouseDown(e, e.shiftKey)}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="px-2 py-1 text-sm whitespace-pre-wrap">
          {String(value || '')}
        </div>
      </td>
    );
  }

  // 数字类型
  if (['Number', 'Decimal'].includes(column.uidt)) {
    if (isEditing) {
      return (
        <td
          className={cellClass}
          style={{ width: column.width, minWidth: column.width }}
        >
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value != null ? String(value) : ''}
            onChange={(e) =>
              handleChange(e.target.value ? Number(e.target.value) : null)
            }
            onBlur={handleBlur}
            className="h-full rounded-none border-none text-right shadow-none focus-visible:ring-0"
          />
        </td>
      );
    }
    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => handleCellMouseDown(e, e.shiftKey)}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="px-2 py-1 text-right text-sm">
          {value != null ? String(value) : ''}
        </div>
      </td>
    );
  }

  // 复选框
  if (column.uidt === 'Checkbox') {
    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => handleCellMouseDown(e, e.shiftKey)}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
      >
        <div className="flex h-full items-center justify-center">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleChange(checked === true)}
            className="cursor-pointer"
          />
        </div>
      </td>
    );
  }

  // 日期
  if (['Date', 'DateTime'].includes(column.uidt)) {
    const dateValue = value ? new Date(String(value)) : undefined;
    const isValidDate = dateValue && !isNaN(dateValue.getTime());
    const displayFormat =
      column.uidt === 'DateTime' ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
    const displayText = isValidDate ? format(dateValue, displayFormat) : '';

    // 处理日期选择
    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        // 对于 DateTime，保留原来的时间部分
        if (column.uidt === 'DateTime' && isValidDate) {
          date.setHours(dateValue.getHours(), dateValue.getMinutes());
        }
        const formattedDate =
          column.uidt === 'DateTime'
            ? format(date, "yyyy-MM-dd'T'HH:mm")
            : format(date, 'yyyy-MM-dd');
        handleChange(formattedDate);
      } else {
        handleChange('');
      }
      handleBlur();
    };

    // 使用 Popover + Calendar 替代原生 input
    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => {
          // 如果点击的是 popover 内部，不处理
          if (
            (e.target as HTMLElement).closest('[data-slot="popover-content"]')
          )
            return;
          handleCellMouseDown(e, e.shiftKey);
        }}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
      >
        <Popover
          open={isEditing}
          onOpenChange={(open) => !open && handleBlur()}
        >
          <PopoverTrigger asChild>
            <div
              className="flex h-full cursor-pointer items-center truncate px-2 py-1 text-sm"
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              {displayText || (
                <span className="text-muted-foreground">选择日期</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={isValidDate ? dateValue : undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
            {column.uidt === 'DateTime' && (
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">时间:</span>
                  <Input
                    type="time"
                    value={isValidDate ? format(dateValue, 'HH:mm') : ''}
                    onChange={(e) => {
                      if (isValidDate && e.target.value) {
                        const [hours, minutes] = e.target.value
                          .split(':')
                          .map(Number);
                        const newDate = new Date(dateValue);
                        newDate.setHours(hours ?? 0, minutes ?? 0);
                        const formattedDate = format(
                          newDate,
                          "yyyy-MM-dd'T'HH:mm",
                        );
                        handleChange(formattedDate);
                      }
                    }}
                    className="h-8 w-24"
                  />
                </div>
              </div>
            )}
            {isValidDate && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDateSelect(undefined)}
                >
                  清除日期
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </td>
    );
  }

  // 单选
  if (column.uidt === 'SingleSelect') {
    const options = column.meta?.options || [];
    const selectedOpt = options.find(
      (o) => o.id === value || o.title === value,
    );

    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => {
          if (
            (e.target as HTMLElement).closest('[data-slot="popover-content"]')
          )
            return;
          handleCellMouseDown(e, e.shiftKey);
        }}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
      >
        <Popover
          open={isEditing}
          onOpenChange={(open) => !open && handleBlur()}
        >
          <PopoverTrigger asChild>
            <div
              className="flex h-full cursor-pointer items-center px-2 py-1"
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            >
              {selectedOpt ? (
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${getOptionColor(selectedOpt.color)}`}
                >
                  {selectedOpt.title}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <div className="space-y-0.5">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={`flex cursor-pointer items-center rounded px-2 py-1.5 hover:bg-gray-100 ${
                    value === opt.id || value === opt.title ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => {
                    handleChange(opt.id);
                    handleBlur();
                  }}
                >
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getOptionColor(opt.color)}`}
                  >
                    {opt.title}
                  </span>
                </div>
              ))}
              {selectedOpt && (
                <>
                  <div className="my-1 border-t" />
                  <div
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm text-red-500 hover:bg-red-50"
                    onClick={() => {
                      handleChange(null);
                      handleBlur();
                    }}
                  >
                    <X className="mr-1.5 h-3 w-3" />
                    清除选择
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </td>
    );
  }

  // 多选
  if (column.uidt === 'MultiSelect') {
    const options = column.meta?.options || [];
    const selectedIds = value ? String(value).split(',').filter(Boolean) : [];
    const selectedOpts = options.filter(
      (o) => selectedIds.includes(o.id) || selectedIds.includes(o.title),
    );

    return (
      <td
        className={cellClass}
        style={{ width: column.width, minWidth: column.width }}
        onMouseDown={(e) => {
          if (
            (e.target as HTMLElement).closest('[data-slot="popover-content"]')
          )
            return;
          handleCellMouseDown(e, e.shiftKey);
        }}
        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
      >
        <Popover
          open={isEditing}
          onOpenChange={(open) => !open && handleBlur()}
        >
          <PopoverTrigger asChild>
            <div
              className="flex h-full cursor-pointer flex-wrap items-center gap-1 px-2 py-1"
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            >
              {selectedOpts.length > 0 ? (
                selectedOpts.map((opt) => (
                  <span
                    key={opt.id}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getOptionColor(opt.color)}`}
                  >
                    {opt.title}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {options.map((opt) => {
                const isOptSelected =
                  selectedIds.includes(opt.id) ||
                  selectedIds.includes(opt.title);
                return (
                  <div
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100 ${isOptSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      const newIds = isOptSelected
                        ? selectedIds.filter(
                            (id) => id !== opt.id && id !== opt.title,
                          )
                        : [...selectedIds, opt.id];
                      handleChange(newIds.join(','));
                    }}
                  >
                    <Checkbox
                      checked={isOptSelected}
                      onCheckedChange={(checked) => {
                        const newIds =
                          checked === true
                            ? [...selectedIds, opt.id]
                            : selectedIds.filter(
                                (id) => id !== opt.id && id !== opt.title,
                              );
                        handleChange(newIds.join(','));
                      }}
                    />
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${getOptionColor(opt.color)}`}
                    >
                      {opt.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 border-t pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBlur}
                className="w-full text-xs text-blue-600 hover:bg-blue-50"
              >
                完成
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </td>
    );
  }

  // 默认文本渲染
  return (
    <td
      className={cellClass}
      style={{ width: column.width, minWidth: column.width }}
      onMouseDown={(e) => handleCellMouseDown(e, e.shiftKey)}
      onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="truncate px-2 py-1 text-sm">{String(value ?? '')}</div>
    </td>
  );
});

SmartCell.displayName = 'SmartCell';

export { SmartCell };
