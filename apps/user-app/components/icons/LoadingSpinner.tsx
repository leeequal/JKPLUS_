import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "처리 중..." }) => {
  return (
    <div className="text-center py-16 px-6 bg-slate-800/50 border border-slate-700 rounded-xl">
      <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse-fast"></div>
        <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse-fast [animation-delay:0.2s]"></div>
        <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse-fast [animation-delay:0.4s]"></div>
      </div>
      <h3 className="mt-6 text-lg font-medium text-slate-300">{text}</h3>
      <p className="mt-1 text-sm text-slate-500">
        잠시만 기다려주세요.
      </p>
    </div>
  );
};