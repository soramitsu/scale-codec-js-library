import { defineComponent, inject, InjectionKey, provide, PropType, compile } from 'vue';
import { DefPart, partToSuffix } from '../def-part';

const CURRENT_DEF_PART: InjectionKey<DefPart> = Symbol('def part');

export const WithDefPart = defineComponent({
    props: {
        part: {
            type: String as PropType<DefPart>,
            required: true,
        },
    },
    setup(props, { slots }) {
        provide(CURRENT_DEF_PART, props.part);
        return () => slots.default?.();
    },
});

export function useCurrentDefPart(): DefPart {
    const val = inject(CURRENT_DEF_PART);
    if (!val) throw new Error('no current def part');
    return val;
}

export const AddPartSuffix = defineComponent({
    setup() {
        const part = useCurrentDefPart();
        const suffix = partToSuffix(part);
        return { suffix };
    },
    render: compile(`<slot/>{{ suffix }}`),
});
