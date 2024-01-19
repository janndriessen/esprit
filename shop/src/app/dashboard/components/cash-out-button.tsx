'use client'

import { PrimaryButton as Button } from '@/components/ui/button'
import { useDashboardData } from '@/data/useDashboardData'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

export function CashOutButton() {
  const { paymentsReceived, paymentsSent } = useDashboardData()
  const totalReceivedAmount = paymentsReceived.reduce((acc, payment) => {
    return acc + parseFloat(payment.amount)
  }, 0)
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="text-xl py-4 px-6 transition-colors hover:text-secondary hover:bg-primary-foreground">
          Cash Out
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle className="text-2xl text-center font-semibold">
            Withdraw Funds
          </DrawerTitle>
          <DrawerDescription className="text-md text-center">
            ${totalReceivedAmount.toFixed(2)} USD
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex justify-end space-x-4">
          <DrawerClose asChild>
            <Button variant="outline" className="px-4 py-2">
              Cancel
            </Button>
          </DrawerClose>
          <Button className="px-4 py-2 bg-primary text-white">Withdraw</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
