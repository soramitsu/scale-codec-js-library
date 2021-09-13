import { Ref, defineComponent, reactive, computed, provide, inject, InjectionKey } from 'vue';
import { DefPartSuffixMap } from '../def-part';

export interface CollectorAPI {
    collectRef: (val: string) => void;
    collectCore: (val: string) => void;
    imports: Ref<Set<string>>;
}

function* stdRefsGen(): Generator<string> {
    for (const i of ['str', 'bool', 'Void', 'Compact', 'BytesVec']) {
        yield i;
    }

    for (const bits of [8, 16, 32, 64, 128]) {
        for (const signed of [false, true]) {
            yield `${signed ? 'i' : 'u'}${bits}`;
        }
    }
}
const STD_REFS = new Set(stdRefsGen());

const COLLECTOR_KEY: InjectionKey<CollectorAPI> = Symbol('Collector');

const Collector = defineComponent({
    setup(props, { slots }) {
        const refs = reactive(new Set<string>());
        const cores = reactive(new Set<string>());

        const imports = computed<Set<string>>(() => {
            return new Set([
                ...cores,
                ...[...refs]
                    .filter((x) => STD_REFS.has(x))
                    .flatMap((x) => Object.values(DefPartSuffixMap).map((sfx) => x + sfx)),
            ]);
        });

        provide(COLLECTOR_KEY, {
            collectCore: (x) => cores.add(x),
            collectRef: (x) => refs.add(x),
            imports,
        });

        return () => slots.default?.();
    },
});

export default Collector;

export function useCollectorAPI(): CollectorAPI {
    const val = inject(COLLECTOR_KEY);
    if (!val) throw new Error('no col');
    return val;
}
