import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { awaitGelatoTask } from './gelato'

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
})

const paymentId = uuidv4()
const address = '0xa79b0396ad597ef7328a97887eD0A955967be2C9'
const amountUsd = 127
const ghoPrice = 0.979
const amount = amountUsd * (1 + 1 - ghoPrice)

export function useCreatePayment() {
  const [data, setData] = useState<string | null>(null)

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
  const [isWaiting, setIsWaiting] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const waitForTaskToComplete = async (taskId: string) => {
    setIsWaiting(true)
    const task = await awaitGelatoTask(taskId)
    console.log('task:', task)
    const hash = task?.transactionHash
    if (!hash) {
      console.error('Error waiting for task - no tx hash')
      setIsWaiting(false)
      return
    }
    console.log(`https://sepolia.etherscan.io/tx/${hash}`)
    setTransactionHash(hash)
    setIsWaiting(false)
  }

  useEffect(() => {
    console.log('Connecting to pusher:...', paymentId)
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
      waitForTaskToComplete(taskId)
    })
    return () => {
      pusher.unsubscribe(paymentId)
    }
  }, [paymentId])

  return { isWaiting, transactionHash }
}
