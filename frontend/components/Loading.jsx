import React from 'react';

export default function Loading({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } border-sky-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

