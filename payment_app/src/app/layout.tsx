import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Esprit",
    description: "Easy stablecoin payments",
    viewport: "width=device-width, user-scalable=no",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={inter.className} suppressHydrationWarning={true}>
                {children}
            </body>
        </html>
    );
}
