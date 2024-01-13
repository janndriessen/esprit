import { getNamedAccounts, deployments, getChainId, ethers } from "hardhat";
import { GelatoRelay, CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { PaymentSettlementTestHarness__factory, IERC20Complete__factory } from "../typechain-types";
import {
    generatePayCallData,
    generateVerificationCallData,
} from "../test/utils.ts";

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

    let amount = ethers.utils.parseEther("0.01");
    let receiver = "0x31B50d926f9d01A476a7225F5b807f7807B39B0A";
    const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
    const ghoAddress = "0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211";
    const gho = IERC20Complete__factory.connect(ghoAddress, deployerSigner);
    const relativeDeadline = 60 * 60;
    const deadline = Math.floor(new Date().getTime() / 1000) + relativeDeadline;
    const fee = ethers.utils.parseEther("0.000000000001");
    const feeToken = wethAddress;
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
        paymentSettlement
    );
    const task = await createTask(
        payCalldata,
        paymentSettlement.address,
        chainId,
        ghoAddress
    );
    await awaitTask(task);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
