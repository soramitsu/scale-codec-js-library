<template>
  <button id="act" @click="act">Click to run encode/decode</button>

  <div id="result">{{ resultFormatted }}</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { Option, Enum, Result } from '@scale-codec/definition-runtime'
import { encodeAndDecodeReallyComplexData } from './encode-decode'

export default defineComponent({
  setup() {
    type ResultOpt = Option<Result<null, Error>>

    const result = ref<ResultOpt>(Enum.variant('None'))

    const resultFormatted = computed<null | string>(() =>
      result.value.match({
        None: () => null,
        Some: (result) =>
          result.match({
            Ok: () => 'ok',
            Err: ({ message }) => `Not ok: ${message}`,
          }),
      }),
    )

    function act() {
      result.value = Enum.variant<ResultOpt>('Some', encodeAndDecodeReallyComplexData())
    }

    return {
      act,
      resultFormatted,
    }
  },
})
</script>
