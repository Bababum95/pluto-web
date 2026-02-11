export function sanitizeDecimal(value: string): string {
  return value
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1')
}
