import { allArrayItemsShouldBeTheSame } from '../../test/util'
import { encode as encodePolka } from './polka'
import { encode as encodeCore } from './scale-codec-core'
import { encode as encodeCoreV4 } from './scale-codec-core-v4'
import { encode as encodeRuntime } from './scale-codec-runtime'
import { encode as encodeRuntimeAlt } from './scale-codec-runtime-alt'
import { encode as encodeRuntimeV8 } from './scale-codec-runtime-v8'

test('Different encoders are identical', () => {
    const INPUT = Array.from({ length: 32 }, (_, i) => BigInt(i))

    const result = [encodeCore, encodeCoreV4, encodeRuntime, encodeRuntimeV8, encodePolka, encodeRuntimeAlt].map((fn) =>
        fn(INPUT),
    )

    allArrayItemsShouldBeTheSame(result)
})
