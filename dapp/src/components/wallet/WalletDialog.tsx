"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
// import { useAptosWallet } from '@razorlabs/wallet-kit';
import Image from "next/image";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Network } from "@aptos-labs/ts-sdk";
import {
  AlertCircle,
  ArrowRight,
  CircleDashed,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAvailableAptosWallets } from "@/lib/wallet-kit/hooks/useAvailableAptosWallets";
import { IWallet } from "@razorlabs/m1-wallet-sdk";
import { PRESET_WALLET } from "@/lib/utils/constants";
import { useAptosWalletAdapterDetection } from "@/lib/wallet-kit/hooks/useAptosWalletAdapterDetection";
import type { Wallet as WalletAdapter } from "@wallet-standard/core";
import { useAptosWallet } from "@razorlabs/wallet-kit";

interface WalletDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConnectSuccess?: (walletName: string) => void;
  onConnectError?: (error: Error) => void;
}

type WalletItemProps = {
  wallet: IWallet;
  isInstalled: boolean;
  onSelect?: (wallet: IWallet) => void;
};

const WalletItem = (props: WalletItemProps) => {
  const { wallet, isInstalled } = props;
  const [icon, setIcon] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!wallet.iconUrl) return;
    setIcon(wallet.iconUrl);
    setImageError(false);
  }, [wallet.iconUrl]);

  const renderIcon = () => {
    if (imageError || !icon) {
      return (
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-xs font-medium">
            {wallet.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <Image
        src={icon}
        alt={wallet.name}
        width={36}
        height={36}
        className="rounded-lg"
        onError={() => setImageError(true)}
        unoptimized
      />
    );
  };

  return (
    <div
      key={wallet.name}
      onClick={() => {
        if (isInstalled) {
          props.onSelect?.(wallet);
        }
      }}
      className={`flex h-[80px] w-full cursor-pointer items-center justify-between rounded-xl bg-white/50 backdrop-blur-sm px-6 py-4 transition-all hover:bg-white/80 hover:shadow-md border border-gray-100 ${
        isInstalled
          ? "hover:border-purple-200"
          : "opacity-75 cursor-not-allowed"
      }`}
    >
      <div className="flex items-center gap-4">
        {renderIcon()}
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {wallet.label ?? wallet.name}
          </span>
          {!isInstalled && (
            <span className="text-sm text-gray-500">Not installed</span>
          )}
        </div>
      </div>
      <div className="text-purple-500">
        {isInstalled ? (
          <ArrowRight className="w-5 h-5" />
        ) : (
          <CircleDashed className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
  );
};

type InstallGuideProps = {
  wallet: IWallet;
  onNavBack?: () => void;
};

type ConnectingProps = {
  wallet: IWallet;
  onNavBack?: () => void;
};

const InstallGuide = (props: InstallGuideProps) => {
  const { wallet } = props;
  const [imageError, setImageError] = useState(false);

  const renderIcon = () => {
    if (imageError || !wallet.iconUrl) {
      return (
        <div className="w-[100px] h-[100px] rounded-xl bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-2xl font-medium">
            {wallet.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <Image
        src={wallet.iconUrl}
        alt={`${wallet.name} logo`}
        width={100}
        height={100}
        className="rounded-xl"
        onError={() => setImageError(true)}
        unoptimized
      />
    );
  };

  return (
    <section className="flex flex-col">
      <div className="flex items-center gap-4 border-b p-6">
        <button
          onClick={props.onNavBack}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xl font-semibold">Install Wallet</span>
      </div>
      <div className="flex flex-col items-center gap-4 p-8">
        {renderIcon()}
        <h1 className="text-xl font-semibold">
          You haven&apos;t installed this wallet
        </h1>
        <p className="text-gray-500">
          Install wallet via Chrome Extension Store
        </p>
        <button
          className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white transition-colors hover:bg-blue-600"
          // onClick={() => {
          //   if (!wallet.downloadUrl?.browserExtension) {
          //     throw new Error(
          //       `no downloadUrl config on this wallet: ${wallet.name}`
          //     );
          //   }
          //   window.open(wallet.downloadUrl.browserExtension, "_blank");
          // }}
        >
          Get Wallet
        </button>
      </div>
    </section>
  );
};

const Connecting = (props: ConnectingProps) => {
  const { wallet } = props;
  const [imageError, setImageError] = useState(false);

  const renderIcon = () => {
    if (imageError || !wallet.iconUrl) {
      return (
        <div className="w-[100px] h-[100px] rounded-xl bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-2xl font-medium">
            {wallet.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <Image
        src={wallet.iconUrl}
        alt={`${wallet.name} logo`}
        width={100}
        height={100}
        className="rounded-xl"
        onError={() => setImageError(true)}
        unoptimized
      />
    );
  };

  return (
    <section className="flex flex-col">
      <div className="flex items-center gap-4 border-b p-6">
        <button
          onClick={props.onNavBack}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xl font-semibold">Connect Wallet</span>
      </div>
      <div className="flex flex-col items-center gap-4 p-8">
        {renderIcon()}
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-lg font-medium">
            Connecting to {wallet.name}...
          </span>
        </div>
        <p className="text-center text-gray-500">
          Please confirm the connection in your wallet
        </p>
      </div>
    </section>
  );
};

export function WalletDialog(props: WalletDialogProps) {
  const { select } = useAptosWallet();
  const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
  const [view, setView] = useState<"list" | "install" | "connecting">("list");
  const { configuredWallets } = useAvailableAptosWallets(PRESET_WALLET);
  const { data: detectedWallets } = useAptosWalletAdapterDetection();

  const isWalletInstalled = useCallback(
    (wallet: IWallet) => {
      // Special handling for OKX Wallet
      if (wallet.name.toLowerCase().includes("okx")) {
        return typeof window !== "undefined" && "okxwallet" in window;
      }
      // For other wallets, use the standard detection
      return detectedWallets.some(
        (w: WalletAdapter) => w.name.toLowerCase() === wallet.name.toLowerCase()
      );
    },
    [detectedWallets]
  );

  const handleSelectWallet = useCallback(
    async (wallet: IWallet) => {
      try {
        setSelectedWallet(wallet);
        if (!isWalletInstalled(wallet)) {
          setView("install");
          return;
        }
        setView("connecting");
        await select(wallet.name);
        const accountInfo = (await wallet.adapter.connect(undefined, {
          chainId: 177,
          name: Network.TESTNET,
        })) as any;
        // console.log("accountInfo: ", accountInfo);
        setView("list");
        props.onConnectSuccess?.(wallet.name);
        props.onOpenChange?.(false);
      } catch (error) {
        props.onConnectError?.(error as Error);
        setSelectedWallet(null);
        setView("list");
      }
    },
    [props, isWalletInstalled]
  );

  const handleNavBack = useCallback(() => {
    setView("list");
    setSelectedWallet(null);
  }, []);

  // const isMainnet = network?.name === Network.MAINNET;

  const renderContent = () => {
    if (view === "install" && selectedWallet) {
      return <InstallGuide wallet={selectedWallet} onNavBack={handleNavBack} />;
    }
    if (view === "connecting" && selectedWallet) {
      return <Connecting wallet={selectedWallet} onNavBack={handleNavBack} />;
    }
    return (
      <>
        <DialogTitle className="text-2xl font-bold text-center mb-6 bg-blue-500 bg-clip-text text-transparent">
          Connect Wallet
        </DialogTitle>

        {/* {isMainnet && (
          <Alert variant="warning" className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Some features may not work on Mainnet.
            </AlertDescription>
          </Alert>
        )} */}

        <div className="flex flex-col gap-3">
          {configuredWallets.map((wallet) => (
            <WalletItem
              key={wallet.name}
              wallet={wallet}
              isInstalled={isWalletInstalled(wallet)}
              onSelect={() => handleSelectWallet(wallet)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm">
          <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl">
            {renderContent()}
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
}
