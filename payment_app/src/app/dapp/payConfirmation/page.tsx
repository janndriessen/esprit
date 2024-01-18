"use client";
import { TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import GeneratePaymentCodeButton from "@/components/paymentStatus/GenerateButton"

function PayConfirmation() {
    const searchParams = useSearchParams();
    const address = searchParams.get("address") ?? "";
    const amount = searchParams.get("amount") ?? "";
    const paymentId = searchParams.get("paymentId") ?? "";


    return (
        <main className="flex min-h-screen items-center justify-center">
            <div>
                <span>Confirm Payment</span>

                <div style={{ marginTop: 30 }}>
                    <TextField
                        style={{ width: 320 }}
                        value={amount}
                        label="Amount (USD)"
                        size="medium"
                        variant="outlined"
                        color="primary"
                        disabled
                    />
                </div>

                <GeneratePaymentCodeButton
                    address={address}
                    amount={amount}
                    paymentId={paymentId}
                />

            </div>
        </main>
    );
}

export default PayConfirmation;
