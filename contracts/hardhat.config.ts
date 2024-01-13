import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const goerliRPCURL = "https://rpc.ankr.com/eth_goerli";
const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            forking: {
                url: goerliRPCURL,
                blockNumber: 10366000,
            },
            chainId: 5,
        },
        goerli: {
            url: goerliRPCURL,
            chainId: 5,
            accounts: process.env.GOERLI_PRIVATE_KEY ? ["0x" + process.env.GOERLI_PRIVATE_KEY] : undefined,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: process.env.GOERLI_ETHERSCAN_API_KEY ?? "abc",
    },
};
export default config;
