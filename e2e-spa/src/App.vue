<template>
  <button
    id="act"
    @click="act"
  >
    Click to run encode/decode
  </button>

  <div id="result">
    {{ resultFormatted }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, shallowRef } from 'vue'
import { RustOption, RustResult, variant } from '@scale-codec/definition-runtime'
import { encodeAndDecodeReallyComplexData } from './encode-decode'
import { P, match } from 'ts-pattern'

export default defineComponent({
  setup() {
    type ResultOpt = RustOption<RustResult<null, Error>>

    const result = shallowRef<ResultOpt>(variant('None'))

    const resultFormatted = computed<null | string>(() =>
      match(result.value)
        .with({ tag: 'None' }, () => null)
        .with({ content: { tag: 'Ok' } }, () => 'ok')
        .with({ content: { tag: 'Err', content: P.select() } }, ({ message }) => `Not ok: ${message}`)
        .exhaustive(),
    )

    function act() {
      result.value = variant('Some', encodeAndDecodeReallyComplexData())
    }

    return {
      act,
      resultFormatted,
    }
  },
})
</script>
