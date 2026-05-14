import type { MoneyViewCurrencyDto } from '@/shared/api/generated/model'

import type { RootState } from '@/app/store'

/**
 * Resolve currency fields for an optimistic (temp) account before the server
 * returns the full AccountDto. Uses settings default currency or any existing
 * account with the same currency id; otherwise a neutral placeholder until the
 * catalog is loaded or sync completes.
 */
export function resolveMoneyViewCurrencyForTempAccount(
  currencyId: string,
  decimalDigitsFallback: number,
  getState: () => RootState
): MoneyViewCurrencyDto {
  const state = getState()
  const settingsCurrency = state.settings.settings?.currency
  if (settingsCurrency?.id === currencyId) {
    return {
      id: settingsCurrency.id,
      code: settingsCurrency.code,
      symbol: settingsCurrency.symbol,
      decimal_digits: settingsCurrency.decimal_digits,
    }
  }

  const fromAccount = state.account.accounts.find(
    (a) => a.balance.original.currency.id === currencyId
  )
  if (fromAccount) {
    const c = fromAccount.balance.original.currency
    return {
      id: c.id,
      code: c.code,
      symbol: c.symbol,
      decimal_digits: c.decimal_digits,
    }
  }

  return {
    id: currencyId,
    code: '--',
    symbol: '',
    decimal_digits: decimalDigitsFallback,
  }
}
