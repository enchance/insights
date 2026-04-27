import settings from '@config/settings.ts';
import {StarterTemplate} from '@views/templates.tsx';


export const LoginPage = () => {
  const pageTitle = 'Login';

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <StarterTemplate>
        <h1>Login form here</h1>
      </StarterTemplate>
    </>
  );
}


export const RegisterPage = () => {
  const pageTitle = 'Register';

  return (
    <>
      <title>{`${pageTitle} | ${settings.SITENAME}`}</title>
      <StarterTemplate>
        <h1>Register</h1>
      </StarterTemplate>
    </>
  );
}
