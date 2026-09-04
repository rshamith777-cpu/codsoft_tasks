import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft, Terminal } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  onResetToVault?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends (React.Component as unknown as {
  new (props: Props): {
    props: Props;
    state: State;
    setState(state: Partial<State>): void;
    render(): ReactNode;
  };
}) {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SecureVault ErrorBoundary] Caught exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReturnToVault = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onResetToVault) {
      this.props.onResetToVault();
    } else {
      window.location.hash = '#/vault';
    }
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV !== 'production' || Boolean((import.meta as any)?.env?.DEV);

      return (
        <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
          <div className="w-full max-w-xl glass-panel p-8 rounded-[4px] border border-white/15 shadow-2xl space-y-6 animate-hero-entrance">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono-tech text-[10px] tracking-[0.24em] text-red-400 uppercase">
                  SECUREVAULT
                </div>
                <h2 className="font-mono-tech text-lg font-bold text-white tracking-wider">
                  MODULE ERROR
                </h2>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-sans-main text-white/80 text-sm">
                Unable to render this workspace.
              </p>
              <p className="font-mono-tech text-xs text-white/45 leading-relaxed">
                An isolated runtime fault occurred in this module. Your vault data, active sessions, and cryptographic keys remain fully secure and unaffected.
              </p>
            </div>

            {isDev && this.state.error && (
              <div className="p-3.5 bg-black/70 border border-white/10 rounded-[2px] space-y-1 text-left">
                <div className="flex items-center gap-1.5 font-mono-tech text-[10px] text-amber-400 uppercase">
                  <Terminal className="w-3 h-3" />
                  <span>Development Diagnostic</span>
                </div>
                <div className="font-mono-tech text-[11px] text-red-300 break-words max-h-40 overflow-y-auto">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <div className="font-mono-tech text-[10px] text-white/30 max-h-28 overflow-y-auto whitespace-pre-wrap mt-1">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={this.handleRetry}
              >
                Retry module
              </Button>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={this.handleReturnToVault}
              >
                Return to Vault
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
