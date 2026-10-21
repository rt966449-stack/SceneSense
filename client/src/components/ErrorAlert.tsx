import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 text-red-200 flex items-start gap-3 backdrop-blur">
      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-red-300">Connection or Processing Notice</p>
        <p className="mt-0.5 text-red-200/80 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-red-900/50 hover:bg-red-800/60 border border-red-500/40 text-xs font-semibold text-red-100 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
