import { add, complete, cycle, save, suite } from 'benny'

export * from './shared'

export function saveCustom(name: string) {
  return save({
    folder: 'reports',
    file: name,
    format: 'json',
  })
}

type BennyAddReturn = ReturnType<typeof add>

// eslint-disable-next-line max-params
export async function encodeDecodeSuitePair(
  name: string,
  fileName: string,
  encodeCases: BennyAddReturn[],
  decodeCases: BennyAddReturn[],
) {
  await suite(`${name} (encode)`, ...encodeCases, cycle(), complete(), saveCustom(fileName + '.encode'))
  await suite(`${name} (decode)`, ...decodeCases, cycle(), complete(), saveCustom(fileName + '.decode'))
}
