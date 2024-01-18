import { getNamedAccounts, deployments, getChainId, ethers } from "hardhat";
import { GelatoRelay, CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { PaymentSettlementTestHarness__factory, IERC20Complete__factory } from "../typechain-types";
import {
    generatePayCallData,
    generateVerificationCallData,
} from "../test/utils.ts";

import {
    ghoAddress,
    ethAddress,
} from "../constants/addresses";

async function createTask(
    data: string,
    target: string,
    chainId: number,
    feeToken: string
) {
    const relay = new GelatoRelay();
    const request: CallWithSyncFeeRequest = {
        chainId,
        target,
        data,
        feeToken,
        isRelayContext: true,
    };
    console.log("Creating task with request:", request);
    const { taskId } = await relay.callWithSyncFee(request);
    return taskId;
}

export async function awaitTask(taskId: string) {
    const relay = new GelatoRelay();
    const taskFulfilledPromise = new Promise((resolve, reject) => {
        const maxRetry = 100;
        let retryNum = 0;
        const interval = setInterval(async () => {
            retryNum++;
            if (retryNum > maxRetry) {
                clearInterval(interval);
                reject("Max retry reached");
            }
            const taskStatus = await relay.getTaskStatus(taskId);
            console.log("Task Status", taskStatus);
            if (taskStatus?.taskState == "ExecSuccess") {
                clearInterval(interval);
                resolve(taskStatus);
            }
        }, 500);
    });
    return await taskFulfilledPromise;
}

async function main() {
    const { address: paymentSettlementAddress } = await deployments.get("PaymentSettlementTestHarness");
    console.log("PaymentSettlementTestHarness deployed to:", paymentSettlementAddress);

    let { deployer } = await getNamedAccounts();
    console.log("deployer:", deployer);
    const deployerSigner = await ethers.getSigner(deployer);
    const paymentSettlement = PaymentSettlementTestHarness__factory.connect(paymentSettlementAddress, deployerSigner);

    const { chainId } = (await ethers.provider.getNetwork()) ?? {
        chainId: -1,
    };
    console.log("chainId:", chainId);

    let amount = ethers.utils.parseEther("100");
    let receiver = "0x806C17df35c5678A10EbF844D66c2BbFa973200B";
    const gho = IERC20Complete__factory.connect(ghoAddress, deployerSigner);
    const relativeDeadline = 60 * 60;
    const deadline = Math.floor(new Date().getTime() / 1000) + relativeDeadline;
    const fee = ethers.utils.parseEther("0.000000000001");
    const feeToken = ethAddress;
    let verifyCalldata = await generateVerificationCallData(
        gho,
        amount,
        deadline,
        receiver,
        paymentSettlement,
        feeToken,
        fee
    );

    let payCalldata = await generatePayCallData(
        verifyCalldata,
        ghoAddress,
        amount,
        receiver,
        paymentSettlement,
        false
    );
    const task = await createTask(
        payCalldata,
        paymentSettlement.address,
        chainId,
        feeToken
    );
    await awaitTask(task);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
