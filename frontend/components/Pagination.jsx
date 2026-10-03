import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-between px-2 py-3 ${className}`} aria-label="Pagination">
      <div className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-xs font-medium rounded-md border ${
              page === currentPage
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

