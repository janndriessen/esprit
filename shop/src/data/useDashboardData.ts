import { useEffect, useState } from 'react'
import { PaymentsReceivedDocument, execute } from '../../.graphclient'
import { ethers } from 'ethers'

type Payment = {
  direction: 'sent' | 'received'
  amount: string
  transactionHash: string
  timestamp: Date
  id: string
}

const MERCHANT_ADDRESS = '0xa79b0396ad597ef7328a97887eD0A955967be2C9'

export const useDashboardData = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const paymentsReceived = await execute(PaymentsReceivedDocument, { user: MERCHANT_ADDRESS });
        const formattedPayments = paymentsReceived.data.payments.map((payment: any) => ({
            direction: 'received',
            amount: ethers.formatUnits(payment.amount, 18),
            timestamp: new Date(parseInt(payment.blockTimestamp) * 1000),
            transactionHash: payment.transactionHash,
            id: payment.id,
        }));
        setPayments(formattedPayments);
    };

    fetchData();
}, []);

return payments;
};