import {
  Home01Icon,
  Briefcase06Icon,
  ServerStack03Icon,
  ExchangeDollarIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'

export const MENU_ITEMS = [
  { label: 'common.navigation.home', to: '/', icon: Home01Icon },
  { label: 'common.entities.accounts', to: '/accounts', icon: Briefcase06Icon },
  {
    label: 'common.entities.categories',
    to: '/categories',
    icon: ServerStack03Icon,
  },
  {
    label: 'common.entities.exchangeRates',
    to: '/exchange-rates',
    icon: ExchangeDollarIcon,
  },
  { label: 'common.entities.settings', to: '/settings', icon: Settings01Icon },
] as const
