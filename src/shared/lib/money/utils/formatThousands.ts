export function formatThousands(value: string): string {
  const [integerPart, fractionPart] = value.split('.')
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return fractionPart === undefined
    ? formattedIntegerPart
    : `${formattedIntegerPart}.${fractionPart}`
}
