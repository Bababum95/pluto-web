export function toDecimalString(balance: number, scale: number): string {
  return (balance / 10 ** scale).toFixed(scale)
}
