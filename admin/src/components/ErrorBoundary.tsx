import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 p-16 text-center max-w-xl shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="space-y-4">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="text-red-500" size={48} />
              </div>
              <div className="flex items-center justify-center gap-3">
                <img src="/logo.png" alt="IL" className="w-6 h-6 grayscale opacity-30" />
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">System Interruption</h2>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                A critical runtime exception occurred in the admin terminal. This has been logged for immediate audit.
              </p>
              <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <code className="text-[10px] font-mono text-red-400 block break-all">
                  {this.state.error?.name}: {this.state.error?.message}
                </code>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-4 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black uppercase tracking-[3px] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
            >
              <RefreshCw size={18} />
              Reboot Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
