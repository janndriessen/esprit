import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useGesture } from "react-use-gesture";

type Html5QrcodePluginProps = {
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    fps?: number;
    qrbox?: number;
    disableFlip?: boolean;
    verbose?: boolean;
};

const videoConstraints = {
    facingMode: { ideal: "environment" },
};

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Html5QrcodePluginProps) => {
    let config: Html5QrcodeCameraScanConfig = {
        fps: 1,
    };
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    //config.aspectRatio = window.innerWidth / window.innerHeight;

    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    config.videoConstraints = videoConstraints;
    return config;
};

const qrCodeErrorCallback = (error: any) => {
    console.log("Unable to read qr code");
};

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const Html5QrcodePlugin = (props: Html5QrcodePluginProps) => {
    const qrcodeRegionId = "html5qr-code-full-region";
    const [scannerState, setScannerState] = useState("Initializing");
    const [scannerConfig, setScannerConfig] = useState<
        any
    >(undefined);
    const [html5QrcodeScanner, setHtml5QrcodeScanner] = useState<
        Html5Qrcode | undefined
    >(undefined);
    let imageRef = useRef<any>(undefined);
    useGesture(
        {
            onPinch: ({ offset: [d] }) => {
                zoomTo(1 + d / 50);
            },
        },
        {
            domTarget: imageRef,
            eventOptions: { passive: false },
        }
    );

    function zoomTo(zoomLevel: number) {
        setScannerState("zoomTo: " + zoomLevel);
        if (!html5QrcodeScanner) {
            setScannerState("No scanner");
            return;
        }
        const cameraCapabilities =
            html5QrcodeScanner.getRunningTrackCameraCapabilities() as any;
        const zoomCapability = cameraCapabilities.zoomFeature();
        if (zoomCapability.isSupported()) {
            if (zoomLevel > zoomCapability.max()) {
                setScannerState("Max zoom");
                return;
            }
            if (zoomLevel < zoomCapability.min()) {
                setScannerState("Min zoom");
                return;
            }
            console.log("zooming in");
            const diffToMin = zoomLevel - zoomCapability.min();
            const stepsToZoom = Math.round(diffToMin / zoomCapability.step());
            const newValue =
                zoomCapability.min() + stepsToZoom * zoomCapability.step();
            if (newValue === zoomCapability.value()) {
                setScannerState("Already at zoom level");
                return;
            }
            try {
                setScannerState("Zooming in");
                zoomCapability.apply(newValue);
                setScannerState("Zoomed in to " + newValue);
            } catch (exception: any) {
                setScannerState("Error wnhen trying to zoom");
                setScannerState(
                    "Error when trying to zoom:" + exception.toString()
                );
            }
        } else {
            setScannerState("No Zoom");
        }
    }

    useEffect(() => {
        const verbose = props.verbose === true;
        const html5QrcodeScanner = new Html5Qrcode(qrcodeRegionId, verbose);
        if (!props.qrCodeSuccessCallback) {
            throw "qrCodeSuccessCallback is required callback.";
        }
        const qrCodeSuccessCallback = (
            decodedText: string,
            decodedResult: any
        ) => {
            setScannerState("Parsing");
            html5QrcodeScanner.stop();
            try {
                props.qrCodeSuccessCallback(decodedText, decodedResult);
            } catch (exception) {
                console.error(exception);
                setScannerState("Error please try again");
                html5QrcodeScanner.resume();
            }
        };
        // when component mounts
        const config = createConfig(props);
        setScannerConfig(config);

        async function initializeScanner() {
            // Suceess callback is required.
            console.log("Initializing scanner", config);
            const cameras = await Html5Qrcode.getCameras();
            console.log("Cameras found", cameras);
            let cameraId = cameras[0].id;

            setScannerState("Scanning");
            await html5QrcodeScanner.start(
                cameraId,
                config,
                qrCodeSuccessCallback,
                qrCodeErrorCallback
            );

            console.log("config", config);
            const capabilities = html5QrcodeScanner.getRunningTrackCapabilities();
            console.log("Capabilities", capabilities);
            const settings = html5QrcodeScanner.getRunningTrackSettings();
            console.log("Settings", settings);
            setScannerConfig({
                config,
                capabilities,
                settings,
            });
            setHtml5QrcodeScanner(html5QrcodeScanner);
        }
        initializeScanner();

        return () => {
            try {
                html5QrcodeScanner.stop();
                console.log("Scanner stopped");
                html5QrcodeScanner.clear();
                console.log("Scanner cleared");
            } catch (exception) {
                console.error("Error when trying to stop scanner:", exception);
            }
        };
    }, []);

    return (
        <div>
            <div
                className="h-screen w-screen"
                ref={imageRef}
                id={qrcodeRegionId}
            />
        </div>
    );
};

export default Html5QrcodePlugin;
