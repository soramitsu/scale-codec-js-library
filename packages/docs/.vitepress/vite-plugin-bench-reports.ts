import { Plugin } from 'vite'
import path from 'path'
import fs from 'fs/promises'
import fsExtra from 'fs-extra'
import { JsonObject } from 'type-fest'

export default (): Plugin => {
  const MODULE_ID = '~benchmark-reports'

  return {
    name: 'app:benchmark-reports',
    resolveId(id) {
      if (id === MODULE_ID) return id
    },
    async load(id) {
      if (id === MODULE_ID) {
        const resultsDir = path.resolve(__dirname, '../../benchmark/reports')

        const reports = await fs
          .readdir(resultsDir)
          .then((results) => {
            return Promise.all(
              results.map(async (resultFile): Promise<[string, JsonObject]> => {
                const [, key] = resultFile.match(/(.+)\.json$/)!
                return [key, await fsExtra.readJSON(path.join(resultsDir, resultFile))]
              }),
            )
          })
          .then((arr) => Object.fromEntries(arr))

        return `export default ${JSON.stringify(reports)}`
      }
    },
  }
}
