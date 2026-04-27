import {useEffect} from 'react';
import type {IDivProps} from '@core/types.ts';
import {cn} from '@/lib/utils.ts';
import {useAuth} from '@hooks/auth.tsx';
import {FooterComp, NavbarComp} from '@components/essentials.tsx';
import {Outlet, useNavigate} from 'react-router-dom';
import {useAuthStore} from '@core/stores.tsx';
import {useShallow} from 'zustand/react/shallow';


export const RouteWrapper = () => {
    // const navigate = useNavigate();
    const [isAuth, token, setAccount] = useAuthStore(useShallow(s => [s.isAuth, s.token, s.setAccount]));
    // const [setPrevPath, setNavigate] = useAppStore(useShallow(s => [s.setPrevPath, s.setNavigate]))

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        // if (isAuth) setPrevPath(pathname);
    }, []);

    // useEffect(() => {
    //     if (!token) return;
    //
    //     // When page is forcefully refreshed. You probably want to check out loginAction
    //     AuthAPI.fetchAccount()
    //         .then(account => {
    //             setAccount(account)
    //         })
    //         .catch(_ => logoutAction(false));
    // }, []);

    return (
        <div id={'starter-layout'} className={`bg-background text-foreground`}>
            <Outlet />
        </div>
    );
}


export const BaseTemplate = ({children, className}: IDivProps) => {
  return (
    <div className={cn('min-h-svh bg-gray-100', className)}>
      {children}
    </div>
  )
}


export const StarterTemplate = ({children, className}: IDivProps) => {
  const {isAuth} = useAuth();

  return (
    <BaseTemplate className="flex flex-col">
      <NavbarComp />
      <div className={cn('flex-1', className)}>
        {children}
      </div>
      <FooterComp />
    </BaseTemplate>
  );
}


export const CardTemplate = ({children, className}: IDivProps) => {
  return (
    <StarterTemplate>
      <div className={cn('', className)}>
        {children}
      </div>
    </StarterTemplate>
  );
}
