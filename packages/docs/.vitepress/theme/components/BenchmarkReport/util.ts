import { ReportData } from './types'
import { parseCaseName, CaseType } from '@scale-codec/benchmark/src/util'
import { List, Map } from 'immutable'

export interface ReportDataParsed {
  name: string
  labels: string[]
  datasets: Record<CaseType, DatasetEntry[]>
}

export interface DatasetEntry {
  ops: number
  margin: number
}

function zipCases(
  tuples: List<[CaseType, { name: string; data: DatasetEntry }]>,
): Map<string, Record<CaseType, DatasetEntry>> {
  return tuples.reduce(
    (map, [type, { name, data }]) =>
      map.update(name, {} as any, (rec) => {
        rec[type] = data
        console.log(rec)
        return rec
      }),
    Map(),
  )
}

export function organizeReportData(data: ReportData): ReportDataParsed {
  const results = List(data.results).map<[CaseType, { name: string; data: DatasetEntry }]>((x) => {
    const { type, pkg, version } = parseCaseName(x.name)
    const name = `${pkg} v${version}`
    return [type, { name, data: { ops: x.ops, margin: x.margin } }]
  })

  const zipped = zipCases(results).sortBy((val, key) => key)

  const labels = zipped.keySeq().toArray()

  const datasets: Map<CaseType, List<DatasetEntry>> = zipped.reduce(
    (acc, val) =>
      (['encode', 'decode'] as const).reduce(
        (acc, type) => acc.update(type, List(), (list) => list.push(val[type])),
        acc,
      ),
    Map(),
  )

  return {
    name: data.name,
    labels,
    datasets: datasets.toJS() as any,
  }
}

export function expandDatasetEntries(data: Record<CaseType, DatasetEntry[]>): { data: number[]; label: string }[] {
  return Object.entries(data).map(([label, entries]) => ({ label, data: entries.map((x) => x.ops) }))
}
