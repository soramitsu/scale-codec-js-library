const HelpersCounterStateSym = Symbol('CounterState')

export const StdDefHelpers = {
  Valuable: 'Valuable',
  defAlias: 'defAlias',
  defEnum: 'defEnum',
  defOption: 'defOption',
  defResult: 'defResult',
  defMap: 'defMap',
  defSet: 'defSet',
  defStruct: 'defStruct',
  defTuple: 'defTuple',
  defVec: 'defVec',
  defArray: 'defArray',
  defBytesArray: 'defBytesArray',
  EnumSchema: 'EnumSchema',
  Enum: 'Enum',
  Option: 'Option',
  Result: 'Result',
}

export type ImportsCounter = typeof StdDefHelpers & { [HelpersCounterStateSym]: { used: Set<string> } }

export function createImportsCounter(): ImportsCounter {
  const used = new Set<string>()

  return new Proxy(StdDefHelpers as any, {
    get: (target, key) => {
      if (key === HelpersCounterStateSym) {
        return { used }
      }
      if (!(key in target)) throw new Error('wtf?')
      used.add(key as string)
      return target[key]
    },
  }) as any
}

export function getImportsCounterState(counter: ImportsCounter): { used: Set<string> } {
  return counter[HelpersCounterStateSym]
}
