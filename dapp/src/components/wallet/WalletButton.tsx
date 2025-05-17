"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { useCallback, useEffect, useState } from "react";
import { WalletDialog } from "./WalletDialog";
import { ConnectedWalletButton } from "./ConnectedWalletButton";
import { Button } from "../ui/button";
import {
  AccountInfo,
  AptoGetsAccountOutput,
} from "@aptos-labs/wallet-standard";

export function WalletButton() {
  const [showDialog, setShowDialog] = useState(false);
  const { connected, adapter } = useAptosWallet();
  const [accountState, setAccountState] = useState<AccountInfo | null>(null);
  console.log("account: ", accountState);
  console.log("connected: ", connected);
  const getAccount = useCallback(async () => {
    if (adapter) {
      const account = await adapter.account();
      setAccountState(account);
    }
  }, [adapter]);
  useEffect(() => {
    getAccount();
  }, [getAccount]);
  return (
    <WalletDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      onConnectSuccess={(name) => {
        console.log(`Connected to ${name}`);
      }}
      onConnectError={(error) => {
        console.error("Connection error:", error);
      }}
    >
      {connected ? (
        <ConnectedWalletButton />
      ) : (
        <Button
          variant="outline"
          className="bg-blue-500 hover:bg-blue-500/90 text-white hover:text-white/90 border-0 font-medium px-6 py-2 h-10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:brightness-110 w-[160px] justify-center"
        >
          Connect Wallet
        </Button>
      )}
    </WalletDialog>
  );
}
