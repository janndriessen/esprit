import { useEffect, useState } from 'react';
import { PaymentsReceivedDocument, PaymentsSentDocument, execute } from '../../.graphclient';
import { ethers } from 'ethers';

export type Payment = {
  direction: 'sent' | 'received';
  amount: string;
  transactionHash: string;
  timestamp: Date;
  id: string;
  from: string; 
  to: string;
};

const MERCHANT_ADDRESS = '0xa79b0396ad597ef7328a97887eD0A955967be2C9';

export const useDashboardData = () => {
  const [paymentsReceived, setPaymentsReceived] = useState<Payment[]>([]);
  const [paymentsSent, setPaymentsSent] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch payments received
      const received = await execute(PaymentsReceivedDocument, { user: MERCHANT_ADDRESS });
      const formattedReceived = received.data.payments.map((payment: any) => ({
        direction: 'received',
        amount: ethers.formatUnits(payment.amount, 18),
        timestamp: new Date(parseInt(payment.blockTimestamp) * 1000),
        transactionHash: payment.transactionHash,
        id: payment.id,
        from: payment.from,
      }));
      setPaymentsReceived(formattedReceived);

      // Fetch payments sent
      const sent = await execute(PaymentsSentDocument, { user: MERCHANT_ADDRESS });
      const formattedSent = sent.data.payments.map((payment: any) => ({
        direction: 'sent',
        amount: ethers.formatUnits(payment.amount, 18),
        timestamp: new Date(parseInt(payment.blockTimestamp) * 1000),
        transactionHash: payment.transactionHash,
        id: payment.id,
        to: payment.to,
      }));
      setPaymentsSent(formattedSent);
    };

    fetchData();
  }, []);

  return { paymentsReceived, paymentsSent };
};
