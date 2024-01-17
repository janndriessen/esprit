import { PrimaryButton as Button } from '@/components/ui/button'

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

export function RefundButton() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="text-xs ml-4 transition:colors hover:text-secondary hover:bg-primary-foreground">
          Refund
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle className="text-2xl text-center font-semibold">
            Refund Customer Order
          </DrawerTitle>
          <DrawerDescription className="text-md text-center">
            Revert On-Chain Transaction
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex justify-end space-x-4">
          <DrawerClose asChild>
            <Button variant="outline" className="px-4 py-2">
              Cancel
            </Button>
          </DrawerClose>
          <Button className="px-4 py-2 bg-primary text-white">Refund</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
