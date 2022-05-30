export function factory() {
  return Object.fromEntries(Array.from({ length: 40 }, (v, i) => [`key${i}`, i % 3 === 0]))
}
