import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="background flex min-h-screen items-center justify-center p-20">
      <div className="flex-col items-center align-center">
        <Image
          alt="Index Coop Logo"
          src={"/logo.png"}
          height={128}
          width={128}
          className="mx-auto"
        />
        <CardTitle className="text-center text-4xl mt-6">ESPRIT</CardTitle>
        <CardDescription className="text-center mt-2 text-xl">
          Payments made easy
        </CardDescription>
        <div className="flex justify-evenly items-center mt-8">
          <Button asChild variant="default">
            <Link href="/dapp">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
