import { defineConfig } from "@dethcrypto/eth-sdk";

export default defineConfig({
    contracts: {
        sepolia: {
            gho: "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60",
            paymentSettlement: "0x62E028A0FeE5925de63F9bAb1a31Fb922C51386C",
        },
    },
    etherscanURLs: {
        sepolia: "https://api-sepolia.etherscan.io/api",
    },
    rpc: {
        sepolia: "https://eth-sepolia.g.alchemy.com/v2/iC7n7TbS_7ytW6YDhx3OuwPGes0kdHi1",
    },
});
