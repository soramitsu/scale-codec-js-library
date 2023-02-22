declare module '~benchmark-reports' {
  import { ReportData } from './types'

  declare const reports: Record<string, ReportData>

  export default reports
}
