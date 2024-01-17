'use client'

import { motion, useCycle } from 'framer-motion'

import { GhoButton } from './components/gho-button'
import { PaymentPopup } from './components/payment-popup'

export default function Payment() {
  const [isOpen, toggleOpen] = useCycle(false, true)

  const onClickPay = () => {
    console.log('open payment')
    toggleOpen()
  }

  return (
    <div className="bg-contain bg-[url('/assets/nike-online-shop-bg.png')] flex items-center justify-center h-screen">
      <motion.nav initial={false} animate={isOpen ? 'open' : 'closed'}>
        <div className="absolute top-[527px] right-[228px]">
          <GhoButton onClick={onClickPay} />
        </div>
        <PaymentPopup />
      </motion.nav>
    </div>
  )
}
