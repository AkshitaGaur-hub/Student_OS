import React from 'react';

export default function EmptyState({
  icon,
  title = 'No data available',
  description = 'There are currently no records to display.',
  action,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-10 px-4 space-y-3 ${className}`}>
      {icon && <div className="flex justify-center text-slate-400">{icon}</div>}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {description && <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>}
      </div>
      {action ? (
        <div className="pt-2">{action}</div>
      ) : actionText && onAction ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors"
          >
            {actionText}
          </button>
        </div>
      ) : null}
    </div>
  );
}
