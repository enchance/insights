import {NavLink} from 'react-router-dom'
import uipaths from '@config/paths.ts';
import {logoutAction} from '@auth/actions.ts';
import {Button} from '@ui/button.tsx';
import {useAuthStore} from '@core/stores.ts';
import {useAuth} from '@hooks/auth.tsx';


export const NavbarComp = () => {
  const {isAuth} = useAuth();

  // @ts-ignore
  return (
    <div id="navbar" className="bg-white">
      <nav>
        <ul>
          {isAuth ? (
            <>
              <li><NavLink to={uipaths.insights}>View Insights</NavLink></li>
              <li><NavLink to={uipaths.createInsight}>New Insight</NavLink></li>
              <li><a href="#">
                <Button variant="ghost" onClick={() => logoutAction()}>Logout</Button>
              </a></li>
              <li></li>
            </>
          ) : (
            <>
              <li><NavLink to={uipaths.login}>Login</NavLink></li>
              <li><NavLink to={uipaths.register}>Register</NavLink></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}


export const FooterComp = () => {
  return (
    <footer id="footer">
      Footer here
    </footer>
  );
}


export const FormFieldError = ({message}: IFormFieldError) => {
    return <p className="text-xs text-red-500">{message}</p>
}

interface IFormFieldError {
    message: string;
}
