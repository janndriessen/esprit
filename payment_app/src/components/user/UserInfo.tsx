"use client";
import { useEffect, useState } from "react";
import { useWeb3Auth } from "@/provider/Web3AuthProvider";
import { Label } from "@/components/ui/label";
import { getSepoliaSdk } from "@dethcrypto/eth-sdk-client";
import { ethers } from "ethers";
import {
  PaymentsReceivedDocument,
  PaymentsSentDocument,
  execute,
} from "../../../.graphclient";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import dateFormat from "dateformat";

type Payment = {
  direction: "sent" | "received";
  amount: string;
  transactionHash: string;
  timestamp: Date;
  id: string;
};

export function shortenAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (address.length < startLength + endLength) {
    throw new Error("Address is too short to be shortened.");
  }
  const shortenedStart = address.substring(0, startLength);
  const shortenedEnd = address.substring(address.length - endLength);
  return `${shortenedStart}...${shortenedEnd}`;
}

function UserInfo({ className }: { className?: string }) {
  const web3AuthContext = useWeb3Auth();
  const [userAddress, setUserAddress] = useState("...");
  const [userBalance, setUserBalance] = useState("...");
  const [payments, setPayments] = useState<Payment[]>([]);
  useEffect(() => {
    const init = async () => {
      const signer = web3AuthContext?.ethersSigner;
      if (!signer) {
        console.error("Getting user signer failed");
        return;
      }
      const address = await signer.getAddress();
      if (!address) {
        console.error("Getting user address failed");
        return;
      }
      console.log("User Address: ", address);
      setUserAddress(address);

      const sdk = getSepoliaSdk(signer);
      const balance = await sdk.gho.balanceOf(address);
      if (!balance) {
        console.error("Getting user balance failed");
        return;
      }
      console.log("User Balance: ", balance);
      setUserBalance(ethers.utils.formatUnits(balance, 18));
      const paymentsReceived = await execute(PaymentsReceivedDocument, {
        user: address,
      });
      console.log("Payments received: ", paymentsReceived);
      let payments = paymentsReceived.data.payments.map((payment: any) => ({
        direction: "received",
        amount: ethers.utils.formatUnits(payment.amount, 18),
        timestamp: new Date(parseInt(payment.blockTimestamp) * 1000),
        transactionHash: payment.transactionHash,
        id: payment.id,
      }));
      const paymentsSent = await execute(PaymentsSentDocument, {
        user: address,
      });
      console.log("Payments sent: ", paymentsSent);
      payments = payments.concat(
        paymentsSent.data.payments.map((payment: any) => ({
          direction: "sent",
          amount: ethers.utils.formatUnits(payment.amount, 18),
          timestamp: new Date(parseInt(payment.blockTimestamp) * 1000),
          transactionHash: payment.transactionHash,
          id: payment.id,
        }))
      );
      payments.sort((a: any, b: any) => (a.timestamp > b.timestamp ? -1 : 1));
      setPayments(payments);
    };
    init();
  }, [web3AuthContext]);

  return (
    <>
      <Card className="flex flex-col items-center justify-evenly w-full">
        <Label className="text-2xl">Balance:</Label>
        <Label className="text-2xl">
          {userAddress.length > 10 ? shortenAddress(userAddress) : ""}
        </Label>
        <div className="text-2xl font-bold text-center">
          {parseFloat(userBalance).toFixed(2)} $
        </div>
      </Card>

      <div className="grid w-full max-w-sm items-center">
        <ScrollArea>
          <div className="p-4">
            {payments.map((payment, i) => (
              <>
                {i > 0 && <Separator className="my-2" />}
                <a
                  key={payment.id}
                  className={
                    payment.direction == "received"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                  href={`https://sepolia.etherscan.io/tx/${payment.transactionHash}`}
                >
                  <span className="text-left mr-8">
                    {" "}
                    {dateFormat(payment.timestamp, "dd.mm")}{" "}
                  </span>
                  <span className="float-right">
                    {payment.direction == "received" ? " +" : " -"}
                    {payment.amount} $
                  </span>
                </a>
              </>
            ))}
          </div>
        </ScrollArea>{" "}
      </div>
    </>
  );
}

export default UserInfo;
