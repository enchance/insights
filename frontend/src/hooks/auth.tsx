import {useShallow} from 'zustand/react/shallow';
import {type Account} from '@core/types.ts';
import {useAuthStore} from '@core/stores.ts';


type IUseAuth = { isAuth: boolean, account: Account | null };

export const useAuth = (): IUseAuth => {
  let [isAuth, account] = useAuthStore(useShallow(s => [s.isAuth!, s.account]));
  return {isAuth, account} as IUseAuth
}
