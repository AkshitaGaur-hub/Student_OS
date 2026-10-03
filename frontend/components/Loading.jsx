import React from 'react';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
