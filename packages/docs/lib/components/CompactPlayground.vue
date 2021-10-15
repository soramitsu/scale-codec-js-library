<script setup lang="ts">
import { encodeCompact, JSBI } from '@scale-codec/core';
import { computed, ref } from 'vue';
import { hexifyBytes } from '@scale-codec/util';
import { useIntervalFn } from '@vueuse/core';

const num = ref('');

function setRandomNum() {
    const random = ~~(Math.random() * 1e9);
    num.value = String(random);
}

const { pause } = useIntervalFn(setRandomNum, 5_000, {
    immediate: true,
    immediateCallback: true,
});

const numInput = computed({
    get: () => num.value,
    set: (v) => {
        num.value = v;
        pause();
    },
});

const result = computed<any>(() => {
    try {
        const bytes = encodeCompact(JSBI.BigInt(num.value));
        return hexifyBytes(bytes);
    } catch (err) {
        return err;
    }
});
</script>

<template>
    <div class="border-2 rounded border-solid border-gray-200 p-4">
        <label>
            Number:
            <input v-model="numInput">
        </label>

        <LangText>{{ result }}</LangText>
    </div>
</template>
