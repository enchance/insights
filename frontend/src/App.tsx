import '@assets/css/styles.css';
import {RouterProvider} from 'react-router-dom';
import routes from '@core/routes.tsx';
import {ErrorBoundary} from '@components/ErrorBoundary.tsx';


function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={routes} />
    </ErrorBoundary>
  );
}

export default App
