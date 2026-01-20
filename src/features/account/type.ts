import type { IconSvgElement } from '@hugeicons/react'

export type Account = {
  id: string
  name: string
  balance: string
  currency: string
  iconColor: string
  icon: IconSvgElement
}

export type AccountItemProps = Account & {
  onClick?: () => void
  actions?: React.ReactNode
}
