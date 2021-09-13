import { InjectionKey, inject, provide } from 'vue';

const key: InjectionKey<Config> = Symbol('render config');

export interface Config {
    importLib: string;
}

export function useConfig(): Config {
    const val = inject(key);
    if (!val) throw new Error('no config');
    return val;
}

export function provideConfig(conf: Config): void {
    provide(key, conf);
}
