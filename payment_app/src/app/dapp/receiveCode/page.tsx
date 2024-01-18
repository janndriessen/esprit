export const dynamic = "force-dynamic";
import QrCode from "@/components/QrCode";
import PaymentStatusWidget from "@/components/transactionStatus/PaymentStatusWidget";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

function ReceiveCode({ searchParams }: { searchParams: any }) {
    const paymentId = uuidv4();
    console.log("searchParams", searchParams);
    const amount = searchParams.amount;
    const addressAndAmount = new URLSearchParams({
        paymentId,
        ...searchParams,
    }).toString();
    console.log("addressAndAmount", addressAndAmount);

    return (
        <div  className="flex flex-col min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Receiving Payment</CardTitle>
                    <CardDescription>Scan Code to pay {amount} $</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-between">
                    <QrCode data={addressAndAmount} />
                    <PaymentStatusWidget paymentId={paymentId}/>
                </CardContent>
            </Card>
        </div>
    );
}

export default ReceiveCode;
