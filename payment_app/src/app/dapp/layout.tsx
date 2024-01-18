"use client";
import Navigationbar from "@/components/Navigationbar";
import {Web3AuthProvider} from "@/provider/Web3AuthProvider";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
        return (
            <main>
                <div className="flex justify-center items-center fixed top-0 bg-black text-white w-screen h-16 z-50">
                    <div className="text-3xl">Esprit</div>
                </div>
                <Web3AuthProvider>
                    {children}
                </Web3AuthProvider>
                <Navigationbar className="fixed bottom-0 bg-black text-white w-screen h-16"/>
            </main>
        );

}
