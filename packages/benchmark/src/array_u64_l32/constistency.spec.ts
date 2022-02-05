import { allArrayItemsShouldBeTheSame } from '../../test/util'
import { encode as encodePolka } from './polka'
import { encode as encodeCore } from './scale-codec-core'
import { encode as encodeCoreV4 } from './scale-codec-core-v4'
import { encode as encodeRuntime } from './scale-codec-runtime'

test('Different encoders are identical', () => {
    const INPUT = Array.from({ length: 32 }, (_, i) => BigInt(i))

    const result = [encodeCore, encodeCoreV4, encodeRuntime, encodePolka].map((fn) => fn(INPUT))

    allArrayItemsShouldBeTheSame(result)
})
