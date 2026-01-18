import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'

import { AppLayout } from '@/components/AppLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n'
import { useHomePage, TABS, HomePageContent } from '@/features/home'
import { TimeRangeProvider } from '@/features/time-range'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()
  const { activeTab, onTabChange } = useHomePage()

  return (
    <AppLayout className="pb-20">
      <TimeRangeProvider>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <motion.div layout layoutDependency={activeTab}>
            <AnimatePresence mode="wait" initial={false}>
              {TABS.map((tab) => {
                if (activeTab !== tab) return null

                return (
                  <TabsContent key={tab} value={tab} asChild forceMount>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <HomePageContent />
                    </motion.div>
                  </TabsContent>
                )
              })}
            </AnimatePresence>
          </motion.div>

          <TabsList className="w-full h-12 rounded-none border-0 bg-background fixed bottom-0 left-0 right-0 z-50 border-t">
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="flex-1 text-base">
                {t(`home.tabs.${tab}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </TimeRangeProvider>
    </AppLayout>
  )
}
