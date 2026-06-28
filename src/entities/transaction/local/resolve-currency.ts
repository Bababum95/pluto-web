import type {
  AccountDto,
  CurrencyDto,
  SettingsDto,
} from '@/shared/api/generated/model'
import type { MoneyViewCurrencyDto } from '@/shared/lib/money/types'

type SettingsCurrency =
  | CurrencyDto
  | { code: string; symbol: string; decimal_digits: number }

export function resolveTargetCurrency(
  settingsCurrency: SettingsCurrency,
  account: AccountDto
): MoneyViewCurrencyDto {
  if ('id' in settingsCurrency && settingsCurrency.id) {
    return {
      id: settingsCurrency.id,
      code: settingsCurrency.code,
      symbol: settingsCurrency.symbol,
      decimal_digits: settingsCurrency.decimal_digits,
    }
  }

  return account.balance.converted.currency
}

export function resolveSummaryCurrency(
  settings: SettingsDto | null | undefined,
  account: AccountDto
): CurrencyDto {
  if (settings?.currency) {
    return settings.currency
  }

  const view = account.balance.converted.currency
  return {
    id: view.id,
    code: view.code,
    symbol: view.symbol,
    name: view.code,
    symbol_native: view.symbol,
    decimal_digits: view.decimal_digits,
    rounding: 0,
    name_plural: view.code,
    type: 'fiat',
  }
}
