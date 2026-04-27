import settings from '@config/settings.ts';
import {StarterTemplate} from '@views/templates.tsx';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button.tsx';
import uipaths from '@config/paths.ts';


export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <title>{`404 Not Found | ${settings.SITENAME}`}</title>
      <StarterTemplate>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <p className="mt-4 text-lg">Page not found.</p>
          <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Button className="mt-8" onClick={() => navigate(uipaths.insights)}>Go to Insights</Button>
        </div>
      </StarterTemplate>
    </>
  );
};


export const ErrorFallbackPage = ({error}: {error?: Error | null}) => {
  return (
    <>
      <title>{`Error | ${settings.SITENAME}`}</title>
      <div className="min-h-svh flex items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-muted-foreground">Something went wrong</h1>
          {error?.message && (
            <p className="mt-3 text-sm text-muted-foreground font-mono">{error.message}</p>
          )}
          <button className="mt-8 text-sm underline text-muted-foreground" onClick={() => window.location.assign('/')}>
            Reload app
          </button>
        </div>
      </div>
    </>
  );
};
