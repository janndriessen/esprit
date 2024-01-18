"use client";
import { useState } from "react";
import Html5QrcodePlugin from "../../components/Html5QRCodePlugin";
import { useRouter } from "next/navigation";

function Reader() {
    const [qrscan, setQrscan] = useState("No result");
    const router = useRouter();

    const handleResult = (decodedText: string, _decodedResult: any) => {
        if (decodedText) {
            console.log("decodedText:", decodedText);
            setQrscan(decodedText);
            const targetUrl = `/dapp/payConfirmation?${decodedText}`;
            console.log("targetUrl:", targetUrl);
            router.push(targetUrl);
        }
    };

    return (
            <Html5QrcodePlugin
                fps={2}
                qrCodeSuccessCallback={handleResult}
                disableFlip={true}
            />
    );
}

export default Reader;
