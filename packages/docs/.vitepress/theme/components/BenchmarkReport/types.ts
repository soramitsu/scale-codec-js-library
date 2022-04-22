export interface ReportData {
    name: string
    date: string
    version: string | null
    results: Result[]
    fastest: ReportCaseScore
    slowest: ReportCaseScore
}

export interface Result {
    name: string
    ops: number
    margin: number
    percentSlower: number
}

export interface ReportCaseScore {
    name: string
    index: number
}
