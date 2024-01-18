import { ethers } from "ethers";
import { ethAddress, testFeeAmount } from "./constants";
import { BigNumberish, Signer } from "ethers";
import { Gho, PaymentSettlement } from "@dethcrypto/eth-sdk-client/types";
import { GelatoRelay, CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";

export async function createTask(
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

export async function getTokenPermitSignature(
    token: Gho,
    spender: string,
    value: BigNumberish,
    deadline: BigNumberish
) {
    const owner = await token.signer.getAddress();
    const [nonce, tokenName, tokenVersion] = await Promise.all([
        token.nonces(owner),
        token.name(),
        "1",
    ]);
    console.log({ nonce, name: tokenName, version: tokenVersion });
    const { chainId } = (await token.provider.getNetwork()) ?? {
        chainId: -1,
    };

    const permitDomain = {
        name: tokenName,
        version: tokenVersion,
        chainId,
        verifyingContract: token.address,
    };
    const permitTypes = {
        Permit: [
            {
                name: "owner",
                type: "address",
            },
            {
                name: "spender",
                type: "address",
            },
            {
                name: "value",
                type: "uint256",
            },
            {
                name: "nonce",
                type: "uint256",
            },
            {
                name: "deadline",
                type: "uint256",
            },
        ],
    };

    const permitValues = {
        owner,
        spender,
        value,
        nonce,
        deadline,
    };

    //@ts-ignore
    const typedSignature = await token.signer._signTypedData(
        permitDomain,
        permitTypes,
        permitValues
    );
    console.log("typedSignature", typedSignature);
    const signature = ethers.utils.splitSignature(typedSignature);

    return {
        permitNonce: nonce,
        permitSignature: {
            v: signature.v,
            r: signature.r,
            s: signature.s,
            deadline,
        },
    };
}

export async function generatePaySignature(
    permitNonce: BigNumberish,
    receiver: string,
    signer: Signer,
    paymentSettlement: PaymentSettlement
) {
    const { chainId } = (await signer.provider?.getNetwork()) ?? {
        chainId: -1,
    };

    const payDomain = {
        name: "PaymentSettlement",
        version: "1",
        chainId,
        verifyingContract: paymentSettlement.address,
    };
    const payTypes = {
        Pay: [
            {
                name: "receiver",
                type: "address",
            },
            {
                name: "permitNonce",
                type: "uint256",
            },
        ],
    };

    const payValues = {
        receiver,
        permitNonce,
    };

    //@ts-ignore
    const typedSignature = await paymentSettlement.signer._signTypedData(
        payDomain,
        payTypes,
        payValues
    );
    console.log("typedSignature", typedSignature);
    const signature = ethers.utils.splitSignature(typedSignature);

    return {
        v: signature.v,
        r: signature.r,
        s: signature.s,
    };
}

export async function generatePaymentStructs(
    token: Gho,
    amount: BigNumberish,
    deadline: BigNumberish,
    receiverAddress: string,
    paymentSettlement: PaymentSettlement
) {
    const { permitSignature, permitNonce } = await getTokenPermitSignature(
        token,
        paymentSettlement.address,
        amount,
        deadline
    );

    const paySignature = await generatePaySignature(
        permitNonce,
        receiverAddress,
        token.signer,
        paymentSettlement
    );
    console.log("paySignature", paySignature);

    const permitData = {
        deadline,
        signature: permitSignature,
    };

    const paymentData = {
        token: token.address,
        from: await paymentSettlement.signer.getAddress(),
        to: receiverAddress,
        amount,
        permitData,
    };
    return {
        paymentData,
        paySignature,
    };
}

export async function generateVerificationCallData(
    token: Gho,
    amount: BigNumberish,
    deadline: BigNumberish,
    receiverAddress: string,
    paymentSettlement: PaymentSettlement
) {
    const { paymentData, paySignature } = await generatePaymentStructs(
        token,
        amount,
        deadline,
        receiverAddress,
        paymentSettlement
    );

    const verifyDataCallData = paymentSettlement.interface.encodeFunctionData(
        "verifyData",
        [paymentData, paySignature, ethAddress, testFeeAmount]
    );
    return verifyDataCallData;
}

export async function generatePayCallData(
    verifyCallData: string,
    tokenAddress: string,
    amount: BigNumberish,
    receiver: string,
    paymentSettlement: PaymentSettlement
) {
    const result = await paymentSettlement.signer.provider?.call({
        to: paymentSettlement.address,
        data: verifyCallData,
    });
    const expectedResult =
        "0x0000000000000000000000000000000000000000000000000000000000000001";
    if (result !== expectedResult) {
        console.log("result", result);
        throw new Error("verifyData failed");
    }

    const [paymentData, paySignature, feeToken, feeAmount] = paymentSettlement.interface.decodeFunctionData(
        "verifyData",
        verifyCallData
    );

    console.log("paymentData", paymentData);
    if(feeToken !== ethAddress) {
        throw new Error("fee token mismatch");
    }
    if (paymentData.token !== tokenAddress) {
        throw new Error("token address mismatch");
    }

    if (!paymentData.amount.eq(amount)) {
        throw new Error("amount mismatch");
    }

    if (paymentData.to !== receiver) {
        throw new Error("receiver mismatch");
    }

    const payCallData = paymentSettlement.interface.encodeFunctionData("pay", [
        paymentData,
        paySignature,
    ]);
    console.log("payCallData", payCallData);
    return payCallData;
}

export async function getTransactions(user: string) {
}
