import {useAuthStore} from '@core/stores.ts';
import type {Account} from '@core/types.ts';
import {AuthAPI} from '@core/services.ts';


export const loginAction = async (accessToken: string): Promise<Account> => {
    const {setToken, setAccount} = useAuthStore.getState();
    setToken(accessToken);
    const account = await AuthAPI.fetchAccount();
    setAccount(account);
    return account;
}

export const logoutAction = async (triggerService: boolean = true) => {
    const isAuth = useAuthStore.getState().isAuth;
    try {
        if (!isAuth) return;
        if (triggerService) await AuthAPI.logout();
    } catch {
        // Best-effort — clear local state regardless
    } finally {
        useAuthStore.getState().clear();
        localStorage.removeItem('INSauth');
    }
}


