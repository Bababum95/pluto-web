import { AppLayout } from '@/components/AppLayout'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import { TransactionTypeTabs } from '@/features/transaction-type'
import { AccountCard, mockAccounts } from '@/features/account'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { selectAccounts } from '@/store/slices/account'
import { useAppSelector } from '@/store/hooks'

export const Route = createFileRoute('/_app/transaction')({
  component: TransactionPage,
})

function TransactionPage() {
  const { t } = useTranslation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>('1')
  const accounts = useAppSelector(selectAccounts)
  const account = accounts.find((acc) => acc.id === selectedAccountId)

  const handleChangeAccount = (id: string) => {
    setSelectedAccountId(id)
    setIsDrawerOpen(false)
  }

  return (
    <AppLayout title={t('transaction.title')} showBackButton>
      <TransactionTypeTabs>
        <div className="flex flex-col gap-4 py-4">
          <ButtonGroup className="w-full">
            <Input placeholder="0" size="lg" />
            <Button variant="outline" size="lg">
              USD
            </Button>
          </ButtonGroup>
          <div className="flex flex-col gap-2">
            <span>{t('transaction.account')}</span>
            <Drawer
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
              modal={true}
            >
              <DrawerTrigger asChild>
                {account ? (
                  <AccountCard
                    {...account}
                    actions={<HugeiconsIcon size={20} icon={UnfoldMoreIcon} />}
                  />
                ) : (
                  <Button variant="outline" className="justify-between w-full">
                    {t('transaction.selectAccount')}
                    <HugeiconsIcon size={20} icon={UnfoldMoreIcon} />
                  </Button>
                )}
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Select Account</DrawerTitle>
                  <DrawerDescription>
                    Choose an account for the transaction
                  </DrawerDescription>
                </DrawerHeader>
                <RadioGroup
                  className="px-4 gap-1 overflow-y-auto pb-4"
                  value={selectedAccountId}
                  onValueChange={handleChangeAccount}
                >
                  {mockAccounts.map((account) => (
                    <FieldLabel htmlFor={account.id} key={account.id}>
                      <Field orientation="horizontal">
                        <div
                          className="flex items-center justify-center size-8 rounded-md mt-0.75 shrink-0"
                          style={{ backgroundColor: account.iconColor }}
                        >
                          <HugeiconsIcon
                            icon={account.icon}
                            className="size-5"
                          />
                        </div>
                        <FieldContent className="gap-0">
                          <FieldTitle>{account.name}</FieldTitle>
                          <FieldDescription>
                            {account.balance} {account.currency}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value={account.id} id={account.id} />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
