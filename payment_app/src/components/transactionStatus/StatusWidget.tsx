"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    awaitTask,
} from "../../utils";

type StatusWidgetProps = {
    taskId: string | undefined;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function StatusWidget(props: StatusWidgetProps) {
    const [state, setState] = useState("processing");
    const [transactionHash, setTransactionHash] = useState("...");
        const router = useRouter();

    async function trackTask(taskId: string) {
        setState("submitted");

        const task = (await awaitTask(taskId)) as any;
        console.log("taskResult:", task);
        setState("confirmed");
        setTransactionHash(task.transactionHash);
        await sleep(2000);
        router.push(`/dapp`);
    }


    useEffect(() => {
        if(props.taskId){
            trackTask(props.taskId);
        }
    });

    if (state === "submitted") {
        return (
            <div>
                <span>Task submitted to relayer</span>
            </div>
        );
    }

    return (
        <div>
            <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noreferrer">Payment processed in tx</a>
        </div>
    );
}

export default StatusWidget;
