import type { IconSvgElement } from '@hugeicons/react'

/**
 * Curated icon collection from @hugeicons/core-free-icons and custom SVGs.
 * Add icons here to make them available in IconPicker and getIconByName.
 * Custom SVGs: define in custom-icons.ts as IconSvgElement, then add to IconName and ICON_REGISTRY below.
 */
import { BankBuildingIcon, CalculatorIcon } from './custom-icons/index'
import {
  Dollar01Icon,
  Dollar02Icon,
  Wallet01Icon,
  Wallet02Icon,
  Money01Icon,
  Money02Icon,
  CreditCardIcon,
  BankIcon,
  PiggyBankIcon,
  ShoppingCart01Icon,
  ShoppingBag01Icon,
  ShoppingBasket01Icon,
  Home01Icon,
  Home02Icon,
  WorkIcon,
  Restaurant01Icon,
  Coffee01Icon,
  Pizza01Icon,
  Hamburger01Icon,
  Car01Icon,
  Bus01Icon,
  TaxiIcon,
  Airplane01Icon,
  Train01Icon,
  HealthIcon,
  GiftIcon,
  Book01Icon,
  MusicNote01Icon,
  GameController01Icon,
  Video01Icon,
  ClothesIcon,
  ReceiptDollarIcon,
  EthereumIcon,
} from '@hugeicons/core-free-icons'

export const DEFAULT_ICON = Dollar01Icon

export const ICON_REGISTRY: Record<string, IconSvgElement> = {
  BankIcon,
  BankBuildingIcon,
  CalculatorIcon,
  HealthIcon,
  Dollar01Icon,
  Dollar02Icon,
  Wallet01Icon,
  Wallet02Icon,
  Money01Icon,
  Money02Icon,
  CreditCardIcon,
  PiggyBankIcon,
  ShoppingCart01Icon,
  ShoppingBag01Icon,
  ShoppingBasket01Icon,
  Home01Icon,
  Home02Icon,
  WorkIcon,
  Restaurant01Icon,
  Coffee01Icon,
  Pizza01Icon,
  Hamburger01Icon,
  Car01Icon,
  Bus01Icon,
  TaxiIcon,
  Airplane01Icon,
  Train01Icon,
  GiftIcon,
  Book01Icon,
  MusicNote01Icon,
  GameController01Icon,
  Video01Icon,
  ClothesIcon,
  ReceiptDollarIcon,
  EthereumIcon,
}

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
      'CalculatorIcon',
      'EthereumIcon',
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
  'Home01Icon',
  'Restaurant01Icon',
  'Car01Icon',
  'HealthIcon',
  'GiftIcon',
  'ReceiptDollarIcon',
]

/**
 * Returns the icon component by name, or undefined if not found.
 */
export function getIconByName(name: string): IconSvgElement | undefined {
  return ICON_REGISTRY[name as IconName]
}

/**
 * Checks if the given name is a valid icon in the registry.
 */
export function isIconName(name: string): name is IconName {
  return name in ICON_REGISTRY
}
