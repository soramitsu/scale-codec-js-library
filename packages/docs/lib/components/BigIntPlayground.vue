<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { AllowedBits, Endianness, BigIntCodecOptions, encodeBigInt, Result, JSBI, Enum } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

const bits = ref<AllowedBits>(32);
const optionsBits: AllowedBits[] = [8, 16, 32, 64, 128];

const endianness = ref<Endianness>('le');
const optionsEnd: Endianness[] = ['le', 'be'];

const signed = ref(false);

const num = ref('5881');
const numAsBI = computed<Result<JSBI, Error>>(() => {
    try {
        return Enum.create('Ok', JSBI.BigInt(num.value));
    } catch (err) {
        return Enum.create('Err', err);
    }
});

const bigIntOpts: BigIntCodecOptions = reactive({ bits, endianness, signed });
const output = computed(() => {
    return numAsBI.value.match<any>({
        Err: (e) => e,
        Ok: (bi) => {
            try {
                return hexifyBytes(encodeBigInt(bi, bigIntOpts));
            } catch (err) {
                return err;
            }
        },
    });
});
</script>

<template>
    <div class="border-2 border-solid rounded border-gray-200 p-4">
        <div class="grid grid-cols-3 gap-4">
            <div class="space-y-4">
                <div>
                    <label>
                        Number:
                        <input
                            v-model="num"
                            class="block"
                        >
                    </label>
                </div>

                <div>
                    <label>
                        <input
                            v-model="signed"
                            type="checkbox"
                        >
                        Signed
                    </label>
                </div>
            </div>
            <div>
                Bits:
                <div class="grid pt-2 -ml-1">
                    <label
                        v-for="x in optionsBits"
                        :key="x"
                    >
                        <input
                            v-model="bits"
                            type="radio"
                            :value="x"
                        >
                        {{ x }}
                    </label>
                </div>
            </div>
            <div>
                Endianness:
                <div class="grid pt-2 -ml-1">
                    <label
                        v-for="x in optionsEnd"
                        :key="x"
                    >
                        <input
                            v-model="endianness"
                            type="radio"
                            :value="x"
                        >
                        {{ x }}
                    </label>
                </div>
            </div>
        </div>

        <div>
            Output:
            <LangText>{{ output }}</LangText>
        </div>
    </div>
</template>
