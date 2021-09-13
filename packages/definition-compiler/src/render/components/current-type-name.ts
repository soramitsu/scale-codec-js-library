import { defineComponent, inject, InjectionKey, provide } from 'vue';

const CURRENT_TYPE_NAME_KEY: InjectionKey<string> = Symbol('current type name');

export const WithCurrentTypeName = defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
    },
    setup(props, { slots }) {
        provide(CURRENT_TYPE_NAME_KEY, props.name);
        return () => slots.default?.();
    },
});

export const TyName = defineComponent({
    setup() {
        const name = useCurrentTypeName();
        return () => name;
    },
});

export function useCurrentTypeName(): string {
    const val = inject(CURRENT_TYPE_NAME_KEY);
    if (!val) throw new Error('No current name');
    return val;
}
