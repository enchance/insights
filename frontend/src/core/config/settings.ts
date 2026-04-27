import {type Env} from '@core/types.ts';


class BaseSettings {
    DEBUG = true;
    SITENAME = 'Insight'

    // Auth
    PASSWORD_MIN = 6;

    // Queries
    DJANGO_URL = import.meta.env.VITE_DJANGO_URL;
    API_V1_BASE = `${this.DJANGO_URL}/api/v1`;
    STALE_TIME = 60 * 30;
}


class DevSettings extends BaseSettings {
    ENV: Env = 'development';
}


class StagingSettings extends BaseSettings {
    ENV: Env = 'staging';
    DEBUG = false;
}


class ProductionSettings extends BaseSettings {
    ENV: Env = 'production';
    DEBUG = false;
}


let settings;
switch(import.meta.env.MODE) {
    case 'development':
        settings = new DevSettings();
        break;
    case 'staging':
        settings = new StagingSettings();
        break;
    default:
        settings = new ProductionSettings();
}


export const isDev = () => settings.ENV == 'development';
export const isStaging = () => settings.ENV == 'staging';
export const isProd = () => settings.ENV == 'production';

export default settings;
