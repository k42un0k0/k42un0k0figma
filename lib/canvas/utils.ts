export function onGuard<T extends keyof HTMLElementEventMap>(
  typeActual: T,
  tuple: [
    type: keyof HTMLElementEventMap,
    e: HTMLElementEventMap[keyof HTMLElementEventMap]
  ]
): tuple is [type: T, e: HTMLElementEventMap[T]] {
  return typeActual === tuple[0];
}
