import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionText,
  onAction,
  icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-slate-300">
      <div className="p-3 bg-slate-100 rounded-full text-slate-500 mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

