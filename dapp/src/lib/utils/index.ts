import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
// import { NetworkName } from "@aptos-labs/wallet-adapter-react";
import { NetworkInfo } from "@aptos-labs/wallet-standard";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const aptosClient = (network?: NetworkInfo | null) => {
  
  if (network?.name === Network.DEVNET as unknown as Network) {
    return DEVNET_CLIENT;
  } else if (network?.name === Network.TESTNET as unknown as Network) {
    return TESTNET_CLIENT;
  } else if (network?.name === Network.MAINNET as unknown as Network) {
    throw new Error("Please use devnet or testnet for testing");
  } else {
    const CUSTOM_CONFIG = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: network?.url,
    });
    return new Aptos(CUSTOM_CONFIG);
  }
};

// Devnet client
export const DEVNET_CONFIG = new AptosConfig({
  network: Network.DEVNET,
});
export const DEVNET_CLIENT = new Aptos(DEVNET_CONFIG);

// Testnet client
export const TESTNET_CONFIG = new AptosConfig({ network: Network.TESTNET });
export const TESTNET_CLIENT = new Aptos(TESTNET_CONFIG);

export const isSendableNetwork = (
  connected: boolean,
  networkName?: string,
): boolean => {
  return connected && !isMainnet(connected, networkName);
};

export const isMainnet = (
  connected: boolean,
  networkName?: string,
): boolean => {
  return connected && networkName === Network.MAINNET;
};


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

