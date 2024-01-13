import { ethers } from "hardhat";
import { BigNumberish, Signer } from "ethers";
import { PaymentSettlement, PaymentSettlementTestHarness, IERC20Complete } from "../typechain-types";

export async function getTokenPermitSignature(
    token: IERC20Complete,
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

    const typedSignature = await token.signer._signTypedData(
        permitDomain,
        permitTypes,
        permitValues
    );
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

    const typedSignature = await paymentSettlement.signer._signTypedData(
        payDomain,
        payTypes,
        payValues
    );
    const signature = ethers.utils.splitSignature(typedSignature);

    return {
        v: signature.v,
        r: signature.r,
        s: signature.s,
    };
}

export async function generatePaymentStructs(
    token: IERC20Complete,
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
    token: IERC20Complete,
    amount: BigNumberish,
    deadline: BigNumberish,
    receiverAddress: string,
    paymentSettlement: PaymentSettlement,
    feeToken: string,
    feeAmount: BigNumberish
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
        [paymentData, paySignature, feeToken, feeAmount]
    );
    return verifyDataCallData;
}

export async function generateTestPaymentCalldata(
    token: IERC20Complete,
    amount: BigNumberish,
    deadline: BigNumberish,
    receiverAddress: string,
    paymentSettlement: PaymentSettlementTestHarness,
    feeToken: string,
    feeAmount: BigNumberish
) {
    const { paymentData, paySignature } = await generatePaymentStructs(
        token,
        amount,
        deadline,
        receiverAddress,
        paymentSettlement
    );

    const verifyDataCallData = paymentSettlement.interface.encodeFunctionData(
        "payTest",
        [paymentData, paySignature, feeToken, feeAmount]
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
        throw new Error("verifyData failed");
    }

    const [paymentData, paySignature] = paymentSettlement.interface.decodeFunctionData(
        "verifyData",
        verifyCallData
    );

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
    return payCallData;
}
