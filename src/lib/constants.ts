import {
  Home01Icon,
  Briefcase06Icon,
  ServerStack03Icon,
  ExchangeDollarIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'

export const MENU_ITEMS = [
  { label: 'common.home', to: '/', icon: Home01Icon },
  { label: 'common.accounts', to: '/accounts', icon: Briefcase06Icon },
  { label: 'common.categories', to: '/categories', icon: ServerStack03Icon },
  {
    label: 'common.exchangeRates',
    to: '/exchange-rates',
    icon: ExchangeDollarIcon,
  },
  { label: 'common.settings', to: '/settings', icon: Settings01Icon },
]
