import QRCode from "qrcode";

type QrCodeProps = {
    data: string | undefined;
};

const QrCode = async (props: QrCodeProps) => {
    const { data } = props;
    const dataUrl = await QRCode.toDataURL(data ?? "");

    return (
        <>
            <div className="grow scale-125">
                <img src={dataUrl} className="object-fill" alt="QR Code"/>
            </div>
        </>
    );
};

export default QrCode;
