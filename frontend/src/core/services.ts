import api from '@core/api.ts';
import type {Account, Insight, InsightCategory, PaginatedResponse} from '@core/types.ts';


export class AuthAPI {
    static login = async (username: string, password: string): Promise<string> => {
      const {data} = await api.post('/auth/login/', {username, password});
        return data.access;
    }

    static logout = async () => await api.post('/auth/logout/');

    static fetchAccount = async (): Promise<Account> => {
        const {data: account} = await api.get('/auth/users/me/');
        return account;
    }

    static register = async (username: string, email: string, password: string, re_password: string): Promise<string> => {
        const {data} = await api.post('/auth/users/', {username, email, password, re_password});
        return data.access;
    }
}

export class InsightsAPI {
    static list = async (params: {page?: number; category?: string} = {}): Promise<PaginatedResponse<Insight>> => {
        const {data} = await api.get('/api/v1/insights/', {params});
        return data;
    }

    static create = async (payload: {title: string; category: InsightCategory; body: string; tags: string[]}): Promise<Insight> => {
        const {data} = await api.post('/api/v1/insights/', payload);
        return data;
    }

    static update = async (id: number, payload: {title: string; category: InsightCategory; body: string; tags: string[]}): Promise<Insight> => {
        const {data} = await api.patch(`/api/v1/insights/${id}/`, payload);
        return data;
    }

    static get = async (id: number): Promise<Insight> => {
        const {data} = await api.get(`/api/v1/insights/${id}/`);
        return data;
    }

    static delete = async (id: number): Promise<void> => {
        await api.delete(`/api/v1/insights/${id}/`);
    }
}

