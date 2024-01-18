import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export function useCreatePayment() {
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

  return { amount, amountUsd, data, paymentId }
}

export function useTrackPayment(paymentId: string) {
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  useEffect(() => {
    console.log('Connecting to pusher:...')
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    })
    pusher.connection.bind('error', function (err: any) {
      console.error('Pusher connection error:', err)
    })
    const channel = pusher.subscribe(paymentId)
    console.log('Subscribed to channel:', paymentId)
    console.log('subscribed channels:')
    pusher.allChannels().forEach((channel) => console.log(channel.name))
    channel.bind('payment-submitted', function (data: { message: string }) {
      console.log('Received pusher event:', data)
      const taskId = data.message
      console.log('task_id:', taskId)
      // TODO: await gelato task
      // TODO: get tx hash
      // TODO set tx hash
    })
    return () => {
      pusher.unsubscribe(paymentId)
    }
  }, [paymentId])

  return { transactionHash }
}
