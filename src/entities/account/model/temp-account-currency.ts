import { queryClient } from '@/shared/api'
import { currencyControllerFindOne } from '@/shared/api/generated/currencies/currencies'
import type {
  CurrencyDto,
  MoneyViewCurrencyDto,
} from '@/shared/api/generated/model'

import type { RootState } from '@/app/store'

function toMoneyViewCurrency(currency: {
  id: string
  code: string
  symbol: string
  decimal_digits: number
}): MoneyViewCurrencyDto {
  return {
    id: currency.id,
    code: currency.code,
    symbol: currency.symbol,
    decimal_digits: currency.decimal_digits,
  }
}

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
    return toMoneyViewCurrency(settingsCurrency)
  }

  const fromAccount = state.account.accounts.find(
    (a) => a.balance.original.currency.id === currencyId
  )
  if (fromAccount) {
    return toMoneyViewCurrency(fromAccount.balance.original.currency)
  }

  return {
    id: currencyId,
    code: '--',
    symbol: '',
    decimal_digits: decimalDigitsFallback,
  }
}

/**
 * Resolve currency for a persisted local account update. Prefer settings /
 * sibling accounts, then the currencies React Query cache, then the API —
 * so changing to a catalog currency that no other account uses still gets
 * real code/symbol/decimal_digits instead of the temp `--` placeholder.
 */
export async function resolveMoneyViewCurrencyForAccountUpdate(
  currencyId: string,
  decimalDigitsFallback: number,
  getState: () => RootState
): Promise<MoneyViewCurrencyDto> {
  const fromLocal = resolveMoneyViewCurrencyForTempAccount(
    currencyId,
    decimalDigitsFallback,
    getState
  )
  if (fromLocal.code !== '--') {
    return fromLocal
  }

  const cached = queryClient.getQueryData<CurrencyDto[]>(['currencies'])
  const fromCache = cached?.find((currency) => currency.id === currencyId)
  if (fromCache) {
    return toMoneyViewCurrency(fromCache)
  }

  try {
    const fromApi = await currencyControllerFindOne(currencyId)
    return toMoneyViewCurrency(fromApi)
  } catch {
    return fromLocal
  }
}
