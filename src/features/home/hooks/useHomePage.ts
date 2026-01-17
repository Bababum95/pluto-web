import { useState } from 'react'

import { DEFAULT_TAB, TABS } from '../constants'
import type { TabType } from '../types'

function isTab(value: string): value is TabType {
  return (TABS as readonly string[]).includes(value)
}

export const useHomePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>(DEFAULT_TAB)

  const handleTabChange = (tab: string) => {
    if (!isTab(tab)) return

    setActiveTab(tab)
  }

  return {
    activeTab,
    onTabChange: handleTabChange,
  }
}
