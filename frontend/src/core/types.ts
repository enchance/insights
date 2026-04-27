import type {ComponentProps, ReactNode} from 'react';


export type Env = 'development' | 'staging' | 'production';

export type VoidCallback = () => void;
export type VoidCallback1<T> = (val: T) => void;
export type VoidCallback2<T, F> = (val1: T, val2: F) => void;
export type VoidCallback3<T, F, J> = (val1: T, val2: F, val3: J) => void;
export type IDivProps = ComponentProps<'div'>;


export interface Account {
    id: number;
    username: string;
    email: string;
    display: string;
    avatar: string;
}

export type InsightCategory = 'macro' | 'equities' | 'fixedincome' | 'alternatives';

export interface Insight {
    id: number;
    title: string;
    category: InsightCategory;
    body: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
