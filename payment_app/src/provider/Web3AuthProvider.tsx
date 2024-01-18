import { createContext, useContext, useState, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

export interface Web3AuthContextType {
    web3Auth: Web3Auth | null;
    web3AuthProvider: IProvider | null;
    ethersProvider: ethers.providers.Web3Provider | null;
    ethersSigner: ethers.Signer | null;
}
{
    /* const provider = new ethers.providers.Web3Provider(this.provider); */
}

export const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

export const useWeb3Auth = () => useContext(Web3AuthContext);

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
    let [web3authContext, setWeb3AuthContext] =
        useState<Web3AuthContextType | null>(null);
    const web3Auth = new Web3Auth({
        clientId:
            "BCR9StsWlvbfz7P_USY5zZoHpH5VzKY2fBM5LKT5w9XxCAmylEH5wTt3aFTRVYWQl4wfu4F-yMxwF6teQ4LQuLI", // Get your Client ID from the Web3Auth Dashboard
        web3AuthNetwork: "sapphire_devnet", // Web3Auth Network
        chainConfig: {
            chainNamespace: "eip155",
            chainId: "0xaa36a7",
            rpcTarget: "https://eth-sepolia.g.alchemy.com/v2/iC7n7TbS_7ytW6YDhx3OuwPGes0kdHi1",
            displayName: "Sepolia",
            blockExplorer: "https://sepolia.etherscan.io/",
            ticker: "ETH",
            tickerName: "ETH",
        },
    });

    async function logIn() {
        try {
            await web3Auth.initModal();
            const web3AuthProvider = await web3Auth.connect();
            if (!web3AuthProvider) {
                console.error("Connecting to web3auth provider failed");
                return;
            }
            const ethersProvider = new ethers.providers.Web3Provider(
                web3AuthProvider
            );
            const ethersSigner = ethersProvider.getSigner();
            setWeb3AuthContext({
                web3Auth,
                web3AuthProvider,
                ethersProvider,
                ethersSigner,
            });
        } catch (e) {
            console.error("Error logging in: ", e);
        }
        console.log("Logged in");
    }

    useEffect(() => {
        logIn();
    }, []);

    return (
        <Web3AuthContext.Provider value={web3authContext}>
            {children}
        </Web3AuthContext.Provider>
    );
}
