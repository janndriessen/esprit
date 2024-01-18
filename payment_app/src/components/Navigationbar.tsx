import Link from "next/link";

import { cn } from "@/lib/utils";
import { BsCamera, BsHouse, BsQrCodeScan } from "react-icons/bs";

function Navigationbar({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <nav
            className={cn(
                "flex justify-center items-center space-x-4 lg:space-x-6",
                className
            )}
            {...props}
        >
            <Link
                href="/dapp/receive"
                className="text-sm font-medium text-white transition-colors p-6"
            >
                <div className="flex flex-col items-center">
                    <BsQrCodeScan size={42} />
                    <div className="text-xs">Request</div>
                </div>
            </Link>
            <Link
                href="/dapp"
                className="text-sm font-medium text-white transition-colors p-6"
            >
                <div className="flex flex-col items-center">
                    <BsHouse size={42} />
                    <div className="text-xs">Home</div>
                </div>
            </Link>
            <Link
                href="/dapp/pay"
                className="text-sm font-medium text-white transition-colors p-6"
            >
                <div className="flex flex-col items-center">
                    <BsCamera size={42} />
                    <div className="text-xs">Pay</div>
                </div>
            </Link>
        </nav>
    );
}
export default Navigationbar;
