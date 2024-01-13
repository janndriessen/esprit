import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const sepoliaRPCURL = "https://gateway.tenderly.co/public/sepolia";
const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            forking: {
                url: sepoliaRPCURL,
                blockNumber: 5077000,
            },
            chainId: 5,
        },
        sepolia: {
            url: sepoliaRPCURL,
            chainId: 5,
            accounts: process.env.SEPOLIA_PRIVATE_KEY ? ["0x" + process.env.SEPOLIA_PRIVATE_KEY] : undefined,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: process.env.SEPOLIA_ETHERSCAN_API_KEY ?? "abc",
    },
};
export default config;
