"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useWeb3Auth } from "@/provider/Web3AuthProvider";

const MAX_AMOUNT = 10000;
const formSchema = z.object({
    amount: z.coerce
        .number()
        .gt(0, {
            message: "Amount must be positive",
        })
        .max(MAX_AMOUNT, {
            message: `Currently the payment is limited to ${MAX_AMOUNT} $`,
        }),
});

export function ReceiveForm() {
    const router = useRouter();
    const web3AuthContext = useWeb3Auth();
    const [address, setAddress] = useState("");

    useEffect(() => {
        const init = async () => {
            console.log("web3AuthContext:", web3AuthContext);
            const userAddress =
                await web3AuthContext?.ethersSigner?.getAddress();
            if (!userAddress) {
                console.error("Getting user address failed");
                return;
            } else {
                console.log("User Address: ", userAddress);
                setAddress(userAddress);
            }
        };
        init();
    });

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>, e: any) {
        e.preventDefault();
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);
        const { amount } = values;
        const url = `/dapp/receiveCode?address=${address}&amount=${amount}`;
        console.log(url);
        router.push(url);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="m-6">
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {address && (
                        <Button type="submit" className="self-center mt-6 text-xl">
                            Generate Code
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}

export default ReceiveForm;
