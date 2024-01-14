import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const sepoliaRPCURL = "https://eth-sepolia.g.alchemy.com/v2/iC7n7TbS_7ytW6YDhx3OuwPGes0kdHi1";
const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            forking: {
                url: sepoliaRPCURL,
                blockNumber: 5078049,
            },
            chainId: 11155111,
        },
        sepolia: {
            url: sepoliaRPCURL,
            chainId: 11155111,
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
