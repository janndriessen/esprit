import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export function usePayment() {
  const [data, setData] = useState<string | null>(null)

  const paymentId = uuidv4()
  const address = '0xmerchant' // TODO: add merchant address
  const amountUsd = 127
  const ghoPrice = 0.979
  const amount = amountUsd * (1 + 1 - ghoPrice)

  const addressAndAmount = new URLSearchParams({
    paymentId,
    address,
    amount: amount.toString(),
    amountUsd: amountUsd.toString(),
  }).toString()

  console.log('addressAndAmount', addressAndAmount)

  useEffect(() => {
    const generatePaymentData = async () => {
      const data = await QRCode.toDataURL(addressAndAmount ?? '')
      setData(data)
    }
    generatePaymentData()
  }, [])

  return { amount, amountUsd, data }
}
