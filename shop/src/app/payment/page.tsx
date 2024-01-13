'use client'

import { useEffect, useState, useRef, MutableRefObject } from 'react'
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
    <div className="flex items-center justify-center h-screen">
      <motion.nav initial={false} animate={isOpen ? 'open' : 'closed'}>
        <PaymentPopup />
        <GhoButton onClick={onClickPay} />
      </motion.nav>
    </div>
  )
}
