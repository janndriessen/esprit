export const dynamic = "force-dynamic";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import StatusWidget from "@/components/transactionStatus/StatusWidget";

async function PaymentStatus({
    searchParams,
}: {
    searchParams: URLSearchParams;
}) {
    const params = new URLSearchParams(searchParams);
    console.log("params", params);
    const taskId = params.get("taskId") ?? undefined;
    if (!taskId) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <h1>Missing parameter</h1>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Processing payment</CardTitle>
                    <CardDescription>
                        Please Wait for the transaction to be processed
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <StatusWidget taskId={taskId} />
                </CardContent>
            </Card>
        </main>
    );
}

export default PaymentStatus;
