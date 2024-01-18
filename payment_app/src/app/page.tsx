import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Home() {
    return (
        <main className="flex min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Esprit</CardTitle>
                    <CardDescription>
                        Easy Payments with QR Codes
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex justify-evenly items-center">
                        <Button asChild variant="default">
                            <Link href="/dapp">Log In</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
