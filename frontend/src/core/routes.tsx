import {lazy} from 'react';
import {type RouteObject, createBrowserRouter} from 'react-router-dom';
import {AuthRouteGuard, GuestRouteGuard} from '@auth/constraints.tsx';
import {LoginPage, RegisterPage} from '@views/auth.tsx';
import {NotFoundPage} from '@views/errors.tsx';

const ListInsightsPage = lazy(() => import('@views/insights.tsx').then(m => ({default: m.ListInsightsPage})));
const CreateInsightPage = lazy(() => import('@views/insights.tsx').then(m => ({default: m.CreateInsightPage})));
const UpdateInsightPage = lazy(() => import('@views/insights.tsx').then(m => ({default: m.UpdateInsightPage})));
const InsightDetailPage = lazy(() => import('@views/insights.tsx').then(m => ({default: m.InsightDetailPage})));
import uipaths from '@config/paths.ts';
import {RouteWrapper} from '@views/templates.tsx';
import {HomeChooser} from '@views/home.tsx';


const openRoutes: RouteObject[] = [
  {path: '/insights/:id', Component: InsightDetailPage},
]

const guestRoutes: RouteObject[] = [
  {path: uipaths.login, Component: LoginPage},
  {path: uipaths.register, Component: RegisterPage},
]

const authRoutes: RouteObject[] = [
  {path: uipaths.insights, Component: ListInsightsPage},
  {path: uipaths.createInsight, Component: CreateInsightPage},
  {path: '/insights/:id/edit', Component: UpdateInsightPage},
]


const routes = createBrowserRouter([
    {path: '/', Component: HomeChooser},
    {
        Component: RouteWrapper, children: [
            ...openRoutes,
            {Component: AuthRouteGuard, children: authRoutes},
            {Component: GuestRouteGuard, children: guestRoutes},
            {path: '*', Component: NotFoundPage},
        ]
    },
]);

export default routes;
