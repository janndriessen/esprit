"use client";
import { useEffect, useState } from "react";
import {
    awaitTask,
} from "../../utils";
import  {
    useCountdown,
} from "../../hooks/useCountdown";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

type ErrorRedirectCountdownProps = {
    error: string | undefined;
}

function ErrorRedirectCountdown(props: ErrorRedirectCountdownProps) {
    const router = useRouter();
    const countdown = useCountdown(10, () => {router.back()});
    return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>An error was encountered while validating your payment</CardDescription>
                </CardHeader>

                <CardContent>
                    You will be redirected to the payment page in {countdown} seconds
                </CardContent>
            </Card>
    );
}

export default ErrorRedirectCountdown;
