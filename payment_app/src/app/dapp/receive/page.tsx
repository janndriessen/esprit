import { ReceiveForm } from "@/components/receiveForm/ReceiveForm";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function Receive() {

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Request</CardTitle>
                    <CardDescription>
                        Generate QR Code to request payment
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ReceiveForm/>
                </CardContent>
            </Card>
        </div>
    );
}

export default Receive;
