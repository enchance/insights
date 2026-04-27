import {lazy} from 'react';
import settings from '@config/settings.ts';
import {StarterTemplate} from '@views/templates.tsx';
import {useAuth} from '@hooks/auth.tsx';
import {LoginPage} from '@views/auth.tsx';

const ListInsightsPage = lazy(() => import('@views/insights.tsx').then(m => ({default: m.ListInsightsPage})));


export const HomeChooser = () => {
  const {isAuth} = useAuth();

  return isAuth ? <ListInsightsPage /> : <LoginPage />
}

export const HomeAuthPage = () => {
  const pageTitle = 'Home Auth';

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <StarterTemplate>
        <h1>Welcome!</h1>
      </StarterTemplate>
    </>
  );
}
