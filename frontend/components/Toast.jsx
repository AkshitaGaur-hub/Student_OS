import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 text-red-800 border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={`flex items-start gap-3 p-3 rounded-lg border shadow-md ${current.bg}`}
        role="alert"
      >
        {current.icon}
        <div className="text-sm font-medium flex-1">{message}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

