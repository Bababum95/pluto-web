export const getFormFieldErrorMessage = (
  errors: Array<{ message?: string } | undefined>
): string => {
  return errors
    .map((error) => error?.message)
    .filter(Boolean)
    .join('\n')
}
