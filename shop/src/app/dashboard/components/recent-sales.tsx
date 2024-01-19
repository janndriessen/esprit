import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefundButton } from './refund-button';

type Payment = {
  direction: 'sent' | 'received';
  amount: string;
  transactionHash: string;
  timestamp: Date;
  id: string;
  from: string;
};

type RecentSalesProps = {
  payments: Payment[];
};

function truncateAddress(address: string, chars = 7): string {
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - 4)}`;
}


export function RecentSales({ payments }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-centre">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>0x</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none"> {truncateAddress(payment.from)}</p>
            <p className="text-sm text-muted-foreground">
              {payment.timestamp.toLocaleDateString()} {' '}
            </p>
          </div>
          <div className="ml-auto font-medium">+${payment.amount}</div>
          <RefundButton />
        </div>
      ))}
    </div>
  );
}
