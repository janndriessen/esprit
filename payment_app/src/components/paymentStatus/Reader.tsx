"use client";
import Html5QrcodePlugin from "../../components/Html5QRCodePlugin";
import { useRouter } from "next/navigation";

type PaymentReaderProps = {
    addressAndAmount: string | undefined;
};

const PaymentCodeReader = async (props: PaymentReaderProps) => {
    const router = useRouter();
    const { addressAndAmount } = props;

    const handleResult = (decodedText: string, _decodedResult: any) => {
        if (decodedText) {
            let params = new URLSearchParams(decodedText);
            console.log(params);
            if (
                params.get("deadline") === null ||
                params.get("r") === null ||
                params.get("s") === null ||
                params.get("v") === null ||
                params.get("sender") === null
            ) {
                throw new Error("Invalid QR Code");
            }
            const targetUrl = `/dapp/receiveConfirmation?${decodedText}&${addressAndAmount}`;
            console.log("targetUrl:", targetUrl);
            router.push(targetUrl);
        }
    };

    return (
        <>
            <span>Reading Payment Code</span>
            <center>
                <div style={{ marginTop: 30 }}>
                    <Html5QrcodePlugin
                        fps={2}
                        qrCodeSuccessCallback={handleResult}
                        disableFlip={false}
                    />
                </div>
            </center>
        </>
    );
};

export default PaymentCodeReader;
