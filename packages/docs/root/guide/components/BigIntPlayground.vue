<script setup lang="ts">
import { ref, computed } from 'vue'
import { encodeBigInt, Result, Enum, BigIntTypes } from '@scale-codec/core'
import { hexifyBytes } from '@scale-codec/util'

const tySelected = ref<BigIntTypes>('i32')

const num = ref('5881')
const numAsBI = computed<Result<bigint, Error>>(() => {
    try {
        return Enum.valuable('Ok', BigInt(num.value))
    } catch (err) {
        return Enum.valuable('Err', err)
    }
})

const output = computed(() => {
    return numAsBI.value.match<any>({
        Err: (e) => e,
        Ok: (bi) => {
            try {
                return hexifyBytes(encodeBigInt(bi, tySelected.value))
            } catch (err) {
                return err
            }
        },
    })
})

function* types(): Generator<BigIntTypes> {
    for (const bits of [8, 16, 32, 64, 128]) {
        for (const sign of 'ui') {
            yield `${sign}${bits}` as BigIntTypes
        }
    }
}
</script>

<template>
    <div class="border-2 border-solid rounded border-gray-200 p-4">
        <div class="grid grid-cols-2 gap-4">
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
                <div>Type:</div>

                <div class="grid grid-cols-4">
                    <template
                        v-for="ty in types()"
                        :key="ty"
                    >
                        <label>
                            <input
                                v-model="tySelected"
                                type="radio"
                                :value="ty"
                            >
                            {{ ty }}
                        </label>
                    </template>
                </div>
            </div>
        </div>

        <div>
            Output:
            <LangText>{{ output }}</LangText>
        </div>
    </div>
</template>
