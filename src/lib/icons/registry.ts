import type { SvgIcon } from './types'

/**
 * Curated icon collection: standalone TSX components in ./components.
 * Add icons: create IconName.tsx in components/, then add to ICON_REGISTRY below.
 */
import { Airplane01Icon } from './components/Airplane01Icon'
import { BahtIcon } from './components/BahtIcon'
import { BankBuildingIcon } from './components/BankBuildingIcon'
import { BankIcon } from './components/BankIcon'
import { BinanceIcon } from './components/BinanceIcon'
import { BingxIcon } from './components/BingxIcon'
import { BitgetIcon } from './components/BitgetIcon'
import { Book01Icon } from './components/Book01Icon'
import { Bus01Icon } from './components/Bus01Icon'
import { BybitIcon } from './components/BybitIcon'
import { Car01Icon } from './components/Car01Icon'
import { ClothesIcon } from './components/ClothesIcon'
import { Coffee01Icon } from './components/Coffee01Icon'
import { CreditCardIcon } from './components/CreditCardIcon'
import { Dollar01Icon } from './components/Dollar01Icon'
import { Dollar02Icon } from './components/Dollar02Icon'
import { DongIcon } from './components/DongIcon'
import { EthereumIcon } from './components/EthereumIcon'
import { GiftIcon } from './components/GiftIcon'
import { GolomtIcon } from './components/GolomtIcon'
import { GameController01Icon } from './components/GameController01Icon'
import { Hamburger01Icon } from './components/Hamburger01Icon'
import { HealthIcon } from './components/HealthIcon'
import { Home01Icon } from './components/Home01Icon'
import { Home02Icon } from './components/Home02Icon'
import { Money01Icon } from './components/Money01Icon'
import { Money02Icon } from './components/Money02Icon'
import { KucoinIcon } from './components/KucoinIcon'
import { MusicNote01Icon } from './components/MusicNote01Icon'
import { OkxCompactIcon } from './components/OkxCompactIcon'
import { OkxIcon } from './components/OkxIcon'
import { PiggyBankIcon } from './components/PiggyBankIcon'
import { Pizza01Icon } from './components/Pizza01Icon'
import { ReceiptDollarIcon } from './components/ReceiptDollarIcon'
import { Restaurant01Icon } from './components/Restaurant01Icon'
import { ShoppingBag01Icon } from './components/ShoppingBag01Icon'
import { ShoppingBasket01Icon } from './components/ShoppingBasket01Icon'
import { ShoppingCart01Icon } from './components/ShoppingCart01Icon'
import { TaxiIcon } from './components/TaxiIcon'
import { TBankIcon } from './components/TBankIcon'
import { TonIdIcon } from './components/TonIdIcon'
import { TonWalletIcon } from './components/TonWalletIcon'
import { Train01Icon } from './components/Train01Icon'
import { TrustWalletIcon } from './components/TrustWalletIcon'
import { Video01Icon } from './components/Video01Icon'
import { Wallet01Icon } from './components/Wallet01Icon'
import { Wallet02Icon } from './components/Wallet02Icon'
import { WorkIcon } from './components/WorkIcon'

export const ICON_REGISTRY = {
  Airplane01Icon,
  BankBuildingIcon,
  BankIcon,
  BahtIcon,
  BinanceIcon,
  BingxIcon,
  BitgetIcon,
  Book01Icon,
  Bus01Icon,
  BybitIcon,
  Car01Icon,
  ClothesIcon,
  Coffee01Icon,
  CreditCardIcon,
  Dollar01Icon,
  Dollar02Icon,
  DongIcon,
  EthereumIcon,
  GiftIcon,
  GameController01Icon,
  GolomtIcon,
  Hamburger01Icon,
  HealthIcon,
  Home01Icon,
  Home02Icon,
  KucoinIcon,
  Money01Icon,
  Money02Icon,
  MusicNote01Icon,
  OkxCompactIcon,
  OkxIcon,
  PiggyBankIcon,
  Pizza01Icon,
  ReceiptDollarIcon,
  Restaurant01Icon,
  ShoppingBag01Icon,
  ShoppingBasket01Icon,
  ShoppingCart01Icon,
  TBankIcon,
  TaxiIcon,
  TonIdIcon,
  TonWalletIcon,
  Train01Icon,
  TrustWalletIcon,
  Video01Icon,
  Wallet01Icon,
  Wallet02Icon,
  WorkIcon,
} as const satisfies Record<string, SvgIcon>

export const DEFAULT_ICON = ICON_REGISTRY.Dollar01Icon

export type IconName = keyof typeof ICON_REGISTRY

/** Icon category: name + list of icon names. */
export type IconCategory = {
  name: string
  icons: IconName[]
}

/** Icons grouped by category for structured display (e.g. IconPicker). */
export const ICON_CATEGORIES: IconCategory[] = [
  {
    name: 'Money & Banking',
    icons: [
      'Dollar01Icon',
      'Dollar02Icon',
      'Wallet01Icon',
      'Wallet02Icon',
      'Money01Icon',
      'Money02Icon',
      'CreditCardIcon',
      'BankIcon',
      'BankBuildingIcon',
      'PiggyBankIcon',
      'ReceiptDollarIcon',
      'EthereumIcon',
      'DongIcon',
      'BahtIcon',
      'BinanceIcon',
      'BybitIcon',
      'BitgetIcon',
      'OkxIcon',
      'OkxCompactIcon',
      'TrustWalletIcon',
      'TBankIcon',
      'TonWalletIcon',
      'TonIdIcon',
      'KucoinIcon',
      'BingxIcon',
      'GolomtIcon',
    ],
  },
  {
    name: 'Shopping',
    icons: ['ShoppingCart01Icon', 'ShoppingBag01Icon', 'ShoppingBasket01Icon'],
  },
  {
    name: 'Home & Work',
    icons: ['Home01Icon', 'Home02Icon', 'WorkIcon'],
  },
  {
    name: 'Food & Drinks',
    icons: [
      'Restaurant01Icon',
      'Coffee01Icon',
      'Pizza01Icon',
      'Hamburger01Icon',
    ],
  },
  {
    name: 'Transport',
    icons: [
      'Car01Icon',
      'Bus01Icon',
      'TaxiIcon',
      'Airplane01Icon',
      'Train01Icon',
    ],
  },
  {
    name: 'Lifestyle',
    icons: [
      'HealthIcon',
      'GiftIcon',
      'Book01Icon',
      'MusicNote01Icon',
      'GameController01Icon',
      'Video01Icon',
      'ClothesIcon',
    ],
  },
]

/** Popular icons (11 items) for quick access in IconPicker or similar. */
export const POPULAR_ICONS: IconName[] = [
  'EthereumIcon',
  'Wallet01Icon',
  'CreditCardIcon',
  'BankIcon',
  'ShoppingCart01Icon',
  'PiggyBankIcon',
  'Restaurant01Icon',
  'Car01Icon',
  'HealthIcon',
  'GiftIcon',
  'ReceiptDollarIcon',
]

/**
 * Returns the icon component by name, or undefined if not found.
 */
export function getIconByName(name: string): SvgIcon | undefined {
  return ICON_REGISTRY[name as IconName]
}

/**
 * Checks if the given name is a valid icon in the registry.
 */
export function isIconName(name: string): name is IconName {
  return name in ICON_REGISTRY
}
