import axios, {type InternalAxiosRequestConfig, type AxiosResponse} from 'axios';
import {useAuthStore} from '@core/stores.ts';
import {logoutAction} from '@auth/actions.ts';
import settings from '@config/settings.ts';
import uipaths from '@config/paths.ts';


const api = axios.create({
    baseURL: settings.DJANGO_URL,
    withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processPendingQueue = (error: unknown, token: string | null) => {
    pendingQueue.forEach(p => error ? p.reject(error) : p.resolve(token!));
    pendingQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        // No Authorization header (e.g. login) so don't refresh
        if (!original.headers?.['Authorization']) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({resolve, reject});
            }).then(token => {
                original.headers['Authorization'] = `Bearer ${token}`;
                return api(original);
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            // Cookie is sent automatically via withCredentials — no body needed
            const {data} = await axios.post(`${settings.DJANGO_URL}/auth/jwt/refresh/`, {}, {withCredentials: true});
            useAuthStore.getState().setToken(data.access);
            processPendingQueue(null, data.access);
            original.headers['Authorization'] = `Bearer ${data.access}`;
            return api(original);
        } catch (err) {
            processPendingQueue(err, null);
            await logoutAction();
            window.location.href = uipaths.login;
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
