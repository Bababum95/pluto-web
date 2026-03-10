export const stringIsValid = (value?: unknown): boolean => {
  return typeof value === 'string' && value.trim() !== ''
}
