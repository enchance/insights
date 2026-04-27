import {useAuthStore} from '@core/stores.tsx';
import {Outlet} from 'react-router-dom';
import {Navigate} from 'react-router-dom';
import uipaths from '@config/paths.ts';
import {useAuth} from '@hooks/auth.tsx';


export const AuthRouteGuard = () => {
    const {isAuth} = useAuth();
    return isAuth ? <Outlet /> : <Navigate to={uipaths.login} replace />
}

export const GuestRouteGuard = () => {
    const {isAuth} = useAuth();
    return isAuth ? <Navigate to="/" replace /> : <Outlet />
}
