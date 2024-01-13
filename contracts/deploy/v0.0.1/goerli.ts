import {DeployFunction} from 'hardhat-deploy/types';
import { getNamedAccounts, deployments, getChainId, ethers } from "hardhat";


const func: DeployFunction = async function () {
    if (process.env.DEPLOY !== "v0.0.1.goerli") {
        return;
    }
    const { deploy } = deployments;

    let { deployer } = await getNamedAccounts();
    console.log("deployer:", deployer);

    const uniV3RouterAddress ="0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

    console.log("\nDeploying PaymentSettlementTestHarness...");
    const flash = await deploy("PaymentSettlementTestHarness", {
        from: deployer,
        args: [uniV3RouterAddress, wethAddress],
    });
    console.log("PaymentSettlementTestHarness deployed to:", flash.address);
};
export default func;
