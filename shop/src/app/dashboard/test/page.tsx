'use client'

import React from 'react'
import { useDashboardData } from '@/data/useDashboardData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Page = () => {
  const { paymentsReceived, paymentsSent } = useDashboardData()

  const totalReceivedAmount = paymentsReceived.reduce((acc, payment) => {
    return acc + parseFloat(payment.amount)
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments Received</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display the payments data */}
        <pre>{JSON.stringify(paymentsReceived, null, 2)}</pre>
        <div>Total Received ${totalReceivedAmount.toFixed(2)} USD</div>
      </CardContent>
    </Card>
  )
}

export default Page
