import {Component} from 'react';
import type {ReactNode} from 'react';
import {ErrorFallbackPage} from '@views/errors.tsx';


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false, error: null};

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackPage error={this.state.error} />;
    }
    return this.props.children;
  }
}
