import { save } from 'benny'

export function saveCustom(name: string) {
  return save({
    folder: 'results',
    file: name,
    format: 'json',
  })
}
