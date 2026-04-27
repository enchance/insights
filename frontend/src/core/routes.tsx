import {type RouteObject, createBrowserRouter} from 'react-router-dom';
// import {RouteWrapper} from '@views/templates.tsx';
// import {Error404} from '@views/error404.tsx';
import {AuthRouteGuard, GuestRouteGuard} from '@auth/constraints.tsx';
import {LoginPage, RegisterPage} from '@views/auth.tsx';
import uipaths from '@config/paths.ts';
import {RouteWrapper} from '@views/templates.tsx';


const openRoutes: RouteObject[] = [
]

const guestRoutes: RouteObject[] = [
  {path: uipaths.login, Component: LoginPage},
  {path: uipaths.register, Component: RegisterPage},
]

const authRoutes: RouteObject[] = [
]

const flashRoutes: RouteObject[] = []


const routes = createBrowserRouter([
    {path: '/', Component: LoginPage},
    {
        Component: RouteWrapper, children: [
            ...openRoutes,
            {Component: AuthRouteGuard, children: authRoutes},
            {Component: GuestRouteGuard, children: guestRoutes},
        ]
    },
]);

export default routes;
