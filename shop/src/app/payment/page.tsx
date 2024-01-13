'use client'

import { GhoButton } from './components/gho-button'

export default function Payment() {
  const onClickPay = () => {
    console.log('open payment')
  }
  return (
    <div className="flex items-center justify-center h-screen">
      <GhoButton onClick={onClickPay} />
    </div>
  )
}
