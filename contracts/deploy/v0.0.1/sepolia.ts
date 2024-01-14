import {DeployFunction} from 'hardhat-deploy/types';
import { getNamedAccounts, deployments, getChainId, ethers } from "hardhat";
import {
    uniV3PoolAddress,
    wethAddress,
} from "../../constants/addresses";


const func: DeployFunction = async function () {
    if (process.env.DEPLOY !== "v0.0.1.sepolia") {
        return;
    }
    const { deploy } = deployments;

    let { deployer } = await getNamedAccounts();
    console.log("deployer:", deployer);

    console.log("\nDeploying PaymentSettlementTestHarness...");
    const flash = await deploy("PaymentSettlementTestHarness", {
        from: deployer,
        args: [uniV3PoolAddress, wethAddress],
    });
    console.log("PaymentSettlementTestHarness deployed to:", flash.address);
};
export default func;
