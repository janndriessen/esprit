import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Signer } from "ethers";
import {
    PaymentSettlement,
    PaymentSettlement__factory,
    IERC20Complete,
    IERC20Complete__factory,
} from "../typechain-types";

import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import {
    getTokenPermitSignature,
    generatePaymentStructs,
    generatePayCallData,
    generateVerificationCallData,
} from "./utils";

export async function impersonateAccount(address: string) {
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
    });
    return ethers.provider.getSigner(address);
}

describe("PaymentSettlement", function () {
    let paymentSettlement: PaymentSettlement;
    const ghoAddress = "0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211";
    const ghoWhale = "0xBccD3054e883F66a71bA0f5c059322170b58A4Ef";
    let gho: IERC20Complete;
    let signer: Signer;
    let receiver: Signer;
    let snapshot: string;
    let paymentSettlementOwnerSigner: Signer;

    before(async function () {
        const signers = await ethers.getSigners();
        signer = signers[0];

        gho = IERC20Complete__factory.connect(ghoAddress, signer);

        receiver = signers[1];
        paymentSettlement = await new PaymentSettlement__factory(signer).deploy();
        const paymentSettlementOwner = await paymentSettlement.owner();
        paymentSettlementOwnerSigner = await impersonateAccount(paymentSettlementOwner);
        const whaleSigner = await impersonateAccount(ghoWhale);
        const ghoAmount = await gho.balanceOf(ghoWhale);
        await gho
            .connect(whaleSigner)
            .transfer(await signer.getAddress(), ghoAmount);
    });

    beforeEach(async function () {
        snapshot = await ethers.provider.send("evm_snapshot", []);
    });
    afterEach(async function () {
        await ethers.provider.send("evm_revert", [snapshot]);
    });

    describe("payment", function () {
        it("can generate permit signature", async function () {
            const relativeDeadline = 60 * 60;
            const deadline =
                Math.floor(new Date().getTime() / 1000) + relativeDeadline;
            const amount = 100;
            const owner = await signer.getAddress();
            const { permitSignature } = await getTokenPermitSignature(
                gho,
                paymentSettlement.address,
                amount,
                deadline
            );
            await gho.permit(
                owner,
                paymentSettlement.address,
                amount,
                deadline,
                permitSignature.v,
                permitSignature.r,
                permitSignature.s,
                { gasLimit: 2_000_000 }
            );
        });

        it("can generate pay signature", async function () {
            const relativeDeadline = 60 * 60;
            const deadline =
                Math.floor(new Date().getTime() / 1000) + relativeDeadline;
            const amount = 100;
            const owner = await signer.getAddress();

            const { paymentData, paySignature } = await generatePaymentStructs(
                gho,
                amount,
                deadline,
                await receiver.getAddress(),
                paymentSettlement
            );

            const result = await paymentSettlement.callStatic.verifySignature(
                paymentData,
                paySignature
            );
        });

        it("data verifies", async function () {
            const relativeDeadline = 60 * 60;
            const deadline =
                Math.floor(new Date().getTime() / 1000) + relativeDeadline;
            const amount = 100;

            const verifyCallData = await generateVerificationCallData(
                gho,
                amount,
                deadline,
                await receiver.getAddress(),
                paymentSettlement
            );

            const result = await signer.provider?.call({
                to: paymentSettlement.address,
                data: verifyCallData,
            });
            const expectedResult =
                "0x0000000000000000000000000000000000000000000000000000000000000001";
            expect(result).to.equal(expectedResult);
        });

        it("can generate payment data", async function () {
            const relativeDeadline = 60 * 60;
            const deadline =
                Math.floor(new Date().getTime() / 1000) + relativeDeadline;
            const amount = 100;

            const verifyCallData = await generateVerificationCallData(
                gho,
                amount,
                deadline,
                await receiver.getAddress(),
                paymentSettlement
            );

            const payCallData = await generatePayCallData(
                verifyCallData,
                gho.address,
                amount,
                await receiver.getAddress(),
                paymentSettlement
            );

        });
        describe("when contract is paused", function () {
            it("cannot pay", async function () {
                const relativeDeadline = 60 * 60;
                const deadline =
                    Math.floor(new Date().getTime() / 1000) + relativeDeadline;
                const amount = 100;

                const verifyCallData = await generateVerificationCallData(
                    gho,
                    amount,
                    deadline,
                    await receiver.getAddress(),
                    paymentSettlement
                );

                const payCallData = await generatePayCallData(
                    verifyCallData,
                    gho.address,
                    amount,
                    await receiver.getAddress(),
                    paymentSettlement
                );

                await paymentSettlement.connect(paymentSettlementOwnerSigner).pause();
                const relatoRelayAddress =
                    "0xaBcC9b596420A9E9172FD5938620E265a0f9Df92";
                const relatoRelaySigner = await impersonateAccount(
                    relatoRelayAddress
                );
                await setBalance(
                    relatoRelayAddress,
                    ethers.utils.parseEther("100000")
                );
                await expect(
                    relatoRelaySigner.sendTransaction({
                        to: paymentSettlement.address,
                        data: payCallData,
                        gasLimit: 2_000_000,
                    })
                ).to.be.revertedWith("Pausable: paused");
            });
        });
    });

    describe("#pause", function () {
        it("can pause", async function () {
            await paymentSettlement.connect(paymentSettlementOwnerSigner).pause();
        });

        it("non admin cannot pause", async function () {
            await expect(paymentSettlement.connect(receiver).pause()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });
    });
    describe("#unpause", function () {
        beforeEach(async function () {
            await paymentSettlement.connect(paymentSettlementOwnerSigner).pause();
        });
        it("can unpause", async function () {
            await paymentSettlement.connect(paymentSettlementOwnerSigner).unpause();
        });

        it("non admin cannot unpause", async function () {
            await expect(paymentSettlement.connect(receiver).unpause()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });
    });
});
