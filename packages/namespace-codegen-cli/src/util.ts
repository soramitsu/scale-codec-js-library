import { join, normalize } from 'path'

export function normalizeRelativePath(path: string): string {
  return normalize(join(process.cwd(), path))
}
