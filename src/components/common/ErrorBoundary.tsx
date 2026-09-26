import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('tdm_my_area');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-white mb-2">
              เกิดข้อผิดพลาดในการแสดงผล
            </h1>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              ระบบตรวจพบข้อผิดพลาดขณะประมวลผลข้อมูลหน้าจอ (ป้องกันหน้าจอว่างเปล่า)
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 max-h-32 overflow-y-auto mb-5">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตและโหลดแดชบอร์ดใหม่</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
