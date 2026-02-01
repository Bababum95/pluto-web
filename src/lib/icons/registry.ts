import type { IconSvgElement } from '@hugeicons/react'

/**
 * Curated icon collection from @hugeicons/core-free-icons.
 * Add icons here to make them available in IconPicker and getIconByName.
 */
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
  AddCircleIcon,
  Add01Icon,
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
  ArrowDataTransferHorizontalIcon,
  PlusSignIcon,
  MoreVerticalIcon,
  Clock04Icon,
  Menu01Icon,
  ArrowLeft02Icon,
  Sun02Icon,
  Moon02Icon,
  ComputerIcon,
  Loading03Icon,
  Cancel01Icon,
  Tick02Icon,
  Globe02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons'

export const DEFAULT_ICON = Dollar01Icon

export type IconName =
  | 'Dollar01Icon'
  | 'Dollar02Icon'
  | 'Wallet01Icon'
  | 'Wallet02Icon'
  | 'Money01Icon'
  | 'Money02Icon'
  | 'CreditCardIcon'
  | 'BankIcon'
  | 'PiggyBankIcon'
  | 'AddCircleIcon'
  | 'Add01Icon'
  | 'ShoppingCart01Icon'
  | 'ShoppingBag01Icon'
  | 'ShoppingBasket01Icon'
  | 'Home01Icon'
  | 'Home02Icon'
  | 'WorkIcon'
  | 'Restaurant01Icon'
  | 'Coffee01Icon'
  | 'Pizza01Icon'
  | 'Hamburger01Icon'
  | 'Car01Icon'
  | 'Bus01Icon'
  | 'TaxiIcon'
  | 'Airplane01Icon'
  | 'Train01Icon'
  | 'HealthIcon'
  | 'GiftIcon'
  | 'Book01Icon'
  | 'MusicNote01Icon'
  | 'GameController01Icon'
  | 'Video01Icon'
  | 'ClothesIcon'
  | 'ReceiptDollarIcon'
  | 'ArrowDataTransferHorizontalIcon'
  | 'PlusSignIcon'
  | 'MoreVerticalIcon'
  | 'Clock04Icon'
  | 'Menu01Icon'
  | 'ArrowLeft02Icon'
  | 'Sun02Icon'
  | 'Moon02Icon'
  | 'ComputerIcon'
  | 'Loading03Icon'
  | 'Cancel01Icon'
  | 'Tick02Icon'
  | 'Globe02Icon'
  | 'ArrowRight01Icon'
  | 'ArrowLeft01Icon'

export const ICON_REGISTRY: Record<IconName, IconSvgElement> = {
  Dollar01Icon,
  Dollar02Icon,
  Wallet01Icon,
  Wallet02Icon,
  Money01Icon,
  Money02Icon,
  CreditCardIcon,
  BankIcon,
  PiggyBankIcon,
  AddCircleIcon,
  Add01Icon,
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
  ArrowDataTransferHorizontalIcon,
  PlusSignIcon,
  MoreVerticalIcon,
  Clock04Icon,
  Menu01Icon,
  ArrowLeft02Icon,
  Sun02Icon,
  Moon02Icon,
  ComputerIcon,
  Loading03Icon,
  Cancel01Icon,
  Tick02Icon,
  Globe02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
}

/** All icon names available in the registry. */
export const ICON_NAMES = Object.keys(ICON_REGISTRY) as IconName[]

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
