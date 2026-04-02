'use client';

import { useState } from 'react';
import clsx from 'clsx';
// import { clsx } from 'clsx';
import { SortIcon, ChevronRightIcon } from './Icons';
import type { TableColumn, AdminPagination } from '@/types/admin';

interface DataTableProps<T extends { id: number }> {
  columns:       TableColumn<T>[];
  data:          T[];
  loading?:      boolean;
  pagination?:   AdminPagination;
  onPageChange?: (page: number) => void;
  /** If provided, rows are selectable and this is called on selection change */
  onSelectionChange?: (ids: number[]) => void;
  selectedIds?:  number[];
  emptyMessage?: string;
  /** Extra row class based on row data */
  rowClassName?: (row: T) => string;
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onSelectionChange,
  selectedIds = [],
  emptyMessage = 'No records found.',
  rowClassName,
}: DataTableProps<T>) {

  const selectable = !!onSelectionChange;

  const allSelected = data.length > 0 && data.every(r => selectedIds.includes(r.id));
  const someSelected = !allSelected && data.some(r => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : data.map(r => r.id));
  };

  const toggleRow = (id: number) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-ui min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {selectable && (
                <th className="w-10 pl-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-cni-blue rounded"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide',
                    col.width && col.width,
                    col.className
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && <SortIcon className="w-3 h-3 text-gray-300" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {selectable && <td className="pl-4 py-3.5"><div className="w-3.5 h-3.5 bg-gray-200 rounded"/></td>}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(row => {
                const selected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      'hover:bg-gray-50 transition-colors',
                      selected && 'bg-cni-blue-light',
                      rowClassName?.(row)
                    )}
                  >
                    {selectable && (
                      <td className="pl-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(row.id)}
                          className="w-3.5 h-3.5 accent-cni-blue rounded"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={clsx('px-4 py-3.5 align-middle', col.className)}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

// ── Pagination sub-component ───────────────────────────────────────────────
function Pagination({
  pagination,
  onPageChange,
}: {
  pagination:   AdminPagination;
  onPageChange?: (page: number) => void;
}) {
  const { current_page, last_page, total, from, to } = pagination;

  // Build page range
  const pages: (number | '...')[] = [];
  if (last_page <= 7) {
    for (let i = 1; i <= last_page; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current_page > 3) pages.push('...');
    for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
      pages.push(i);
    }
    if (current_page < last_page - 2) pages.push('...');
    pages.push(last_page);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
      <p className="text-xs font-ui text-gray-500">
        {from ?? 0}–{to ?? 0} of {total} records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-2 text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange?.(p as number)}
              className={clsx(
                'w-7 h-7 rounded text-xs font-ui font-medium',
                p === current_page
                  ? 'bg-cni-blue text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange?.(current_page + 1)}
          disabled={current_page === last_page}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
