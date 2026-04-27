import {create} from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import type {VoidCallback1, Account, VoidCallback} from '@core/types.ts';
import settings from '@config/settings.ts';


interface IAuthStore {
  token: string;
  isAuth: boolean;
  account: Account | null;
  setToken: VoidCallback1<string>;
  setAccount: VoidCallback1<Account>;
  clear: VoidCallback;
}


export const useAuthStore = create<IAuthStore>()(
  // TODO: Remove token from persistence
  devtools(
    persist(
      (set, get) => ({
        token: '',
        account: null,
        isAuth: false,
        setToken: (token: string) => set({token}),
        setAccount: (account: Account | null) => set({account, isAuth: account !== null}),
        clear: () => set({token: '', isAuth: false, account: null}),
      }),
      {name: 'INSauth'}
    ),
    {enabled: settings.DEBUG, name: 'INSauth'}
  )
);
