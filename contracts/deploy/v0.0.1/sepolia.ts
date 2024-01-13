import {DeployFunction} from 'hardhat-deploy/types';
import { getNamedAccounts, deployments, getChainId, ethers } from "hardhat";


const func: DeployFunction = async function () {
    if (process.env.DEPLOY !== "v0.0.1.sepolia") {
        return;
    }
    const { deploy } = deployments;

    let { deployer } = await getNamedAccounts();
    console.log("deployer:", deployer);

    const uniV3PoolAddress ="0x61875eA61fb66657F29bAF700FA5BDCC3e2DF674";
    const wethAddress = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

    console.log("\nDeploying PaymentSettlementTestHarness...");
    const flash = await deploy("PaymentSettlementTestHarness", {
        from: deployer,
        args: [uniV3PoolAddress, wethAddress],
    });
    console.log("PaymentSettlementTestHarness deployed to:", flash.address);
};
export default func;
