"use client";

import { AptosWalletProvider } from "@razorlabs/wallet-kit";
import { PropsWithChildren } from "react";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletProvider autoConnect={true}>
      {children}
    </AptosWalletProvider>
  );
}
