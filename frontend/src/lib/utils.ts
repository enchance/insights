import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function capitalizeFirstChar(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export function isEmail(email: string): boolean {
    const reg: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return reg.test(email);
}

export const asBool = (v: unknown): boolean => {
    if (v == null) return false; // null | undefined
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object')
        return Object.keys(v as Record<string, unknown>).length > 0;
    if (typeof v === 'number') return v !== 0 && !Number.isNaN(v);

    return true;
};

export const prettyDateTime = (dt: string) => {
    return new Date(dt).toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).replace(',', '').replace('a.m.', 'AM').replace('p.m.', 'PM');
};