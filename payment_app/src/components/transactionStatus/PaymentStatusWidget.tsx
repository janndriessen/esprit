"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

type PaymentStatusWidgetProps = {
    paymentId: string;
};

function PaymentStatusWidget(props: PaymentStatusWidgetProps) {
    const router = useRouter();
    //This will be called when your component is mounted
    useEffect(() => {
        console.log(
            "Connecting to pusher:",
            process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
            process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER
        );
        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_APP_KEY ?? "",
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER ?? "",
            }
        );
        pusher.connection.bind("error", function (err: any) {
            console.error("Pusher connection error:", err);
        });
        const channel = pusher.subscribe(props.paymentId);
        console.log("Subscribed to channel:", props.paymentId);

        console.log("subscribed channels:");
        pusher.allChannels().forEach(channel => console.log(channel.name));

        channel.bind("payment-submitted", function (data: { message: string }) {
            console.log("Received pusher event:", data);
            const taskId = data.message;
            const url = `dapp/receive/receiptStatus?taskId=${taskId}`;
            console.log(url);
            router.push(url);
        });

        return () => {
            pusher.unsubscribe(props.paymentId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // [] would ensure that useEffect is executed only once

    return (
        <div>
            <span>Waiting for payment</span>
        </div>
    );
}

export default PaymentStatusWidget;
