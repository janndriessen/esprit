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
import Image from "next/image";
import Link from "next/link";
import { BsCamera, BsHouse, BsQrCodeScan } from "react-icons/bs";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import dateFormat from "dateformat";
import { Button } from "../ui/button";

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
      <div className="grid w-full max-w-sm items-center">
        <ScrollArea>
          <Card className="flex flex-row w-full p-4 h-[200px] content-between shadow-md rounded-2xl">
            <div className="flex flex-col content-between w-full h-full">
              <div className="flex flex-col h-full">
                <Label className="text-xl font-semibold">ESPRIT</Label>
                <p className="text-md text-gray-400">
                  {userAddress.length > 10 ? shortenAddress(userAddress) : ""}
                </p>
              </div>
              <div className="text-3xl font-bold">
                {parseFloat(userBalance).toFixed(2)} GHO
              </div>
            </div>
            <div className="p-4">
              <Image
                alt="Esprit logo"
                src={"/logo.png"}
                height={96}
                width={96}
              />
            </div>
          </Card>

          <div className="my-4 bg-white bg-opacity-20 px-4 py-4 rounded-xl">
            {payments.map((payment, i) => (
              <>
                {i > 0 && (
                  <Separator className="my-4 bg-foreground opacity-10" />
                )}
                <a
                  key={payment.id}
                  className={
                    payment.direction == "received"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                  href={`https://sepolia.etherscan.io/tx/${payment.transactionHash}`}
                  target="_blank"
                >
                  <span className="text-left mr-8 text-foreground text-lg">
                    {" "}
                    {dateFormat(payment.timestamp, "dd.mm.yy")}{" "}
                  </span>
                  <span className="float-right text-lg">
                    {payment.direction == "received" ? " +" : " -"}
                    {payment.amount} GHO
                  </span>
                </a>
              </>
            ))}
          </div>
        </ScrollArea>

        <div className="flex content-between mx-auto bottom-6 absolute gap-4">
          <Link href="/dapp/receive">
            <Button className="flex h-[64px] px-8 gap-4 rounded-full bg-foreground">
              <BsQrCodeScan size={20} />
              <div className="text-lg">Request</div>
            </Button>
          </Link>
          <Link href="/dapp/pay">
            <Button className="flex h-[64px] px-8 gap-4 rounded-full bg-foreground min-w-[160px]">
              <BsCamera size={20} />
              <div className="text-lg">Pay</div>
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default UserInfo;
