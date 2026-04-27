import {NavLink} from 'react-router-dom'
import uipaths from '@config/paths.ts';


export const NavbarComp = () => {
  return (
    <div id="navbar" className="bg-white">
      <nav>
        <ul>
          <li><NavLink to={uipaths.login}>Login</NavLink></li>
          <li><NavLink to={uipaths.register}>Register</NavLink></li>
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
