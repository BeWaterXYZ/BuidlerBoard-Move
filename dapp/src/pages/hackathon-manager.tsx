"use client";
import "../app/globals.css";

import { useAutoConnect } from "@/components/AutoConnectProvider";
import { DisplayValue, LabelValueGrid } from "@/components/LabelValueGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
// import { WalletSelector as ShadcnWalletSelector } from "@/components/WalletSelector";
// import { MultiAgent } from "@/components/transactionFlows/MultiAgent";
import { SingleSigner } from "@/components/transactionFlows/SingleSigner";
import { useToast } from "@/components/ui/use-toast";
// import { Sponsor } from "@/components/transactionFlows/Sponsor";
// import { TransactionParameters } from "@/components/transactionFlows/TransactionParameters";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// s
// import { Switch } from "@/components/ui/switch";
// import { isMainnet } from "@/utils";
import {
  Aptos,
  Network,
  AptosConfig,
  InputGenerateTransactionPayloadData,
} from "@aptos-labs/ts-sdk";
// import { WalletSelector as AntdWalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
// import { WalletConnector as MuiWalletSelector } from "@aptos-labs/wallet-adapter-mui-design";
import {
  AptosChangeNetworkOutput,
  NetworkInfo,
  WalletInfo,
  isAptosNetwork,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { init as initTelegram } from "@telegram-apps/sdk";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Imports for registering a browser extension wallet plugin on page load
// import { MyWallet } from "@/utils/standardWallet";
// import { registerWallet } from "@aptos-labs/wallet-standard";

import { NavBar } from "@/components/NavBar";

import { AptosWallet, ReadonlyUint8Array, UserResponseStatus } from "@aptos-labs/wallet-standard";

import { WalletButton } from "@/components/wallet/WalletButton";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { isValidElement } from "react";
import { AddProjectForm } from "@/components/AddProjectForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Add this interface declaration at the top of the file, after the imports
declare global {
  interface Window {
    nightly?: {
      aptos: AptosWallet;
    };
  }
}

interface AccountInfo {
  address: {
    data: Uint8Array;
  };
  publicKey: {
    key: {
      data: Uint8Array;
    };
  };
}

// Example of how to register a browser extension wallet plugin.
// Browser extension wallets should call registerWallet once on page load.
// When you click "Connect Wallet", you should see "Example Wallet"
// (function () {
//   if (typeof window === "undefined") return;
//   const myWallet = new MyWallet();
//   registerWallet(myWallet);
// })();

const isTelegramMiniApp =
  typeof window !== "undefined" &&
  (window as any).TelegramWebviewProxy !== undefined;
if (isTelegramMiniApp) {
  initTelegram();
}

async function doGetBalanceByResourceWay(aptos: Aptos, accountAddress: string) {
  const resp = await aptos.getAccountResource({
    accountAddress,
    resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  });
  console.log("resp", resp.coin.value);
  return resp
}

async function doGetBalance(aptos: Aptos, accountAddress: string) {
  const [balance] = await aptos.view({
    payload: {
      function: "0x1::coin::balance",
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
      functionArguments: [accountAddress],
    },
  });
  return balance;
}

// async function buildSimpleTransaction(
//   aptos: Aptos,
//   senderAddress: string,
//   recipientAddress: string,
//   amount: number
// ) {
//   return await aptos.transaction.build.simple({
//     sender: senderAddress,
//     data: {
//       function: "0x1::coin::transfer",
//       typeArguments: ["0x1::aptos_coin::AptosCoin"],
//       functionArguments: [recipientAddress, amount],
//     },
//   });
// }

export default function Home() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [category, setCategory] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [deckUrl, setDeckUrl] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProject = () => {
    setIsDialogOpen(true);
  };

  // const {
  //   account,
  //   connected,
  //   network,
  //   wallet,
  //   changeNetwork,
  //   signAndSubmitTransaction,
  // } = useWallet();
  const { connected, disconnect, account, signAndSubmitTransaction, adapter } =
    useAptosWallet();
  const [accountInfo, setAccountInfo] = useState<AccountInfo| null>(null);

  // Move these inside useEffect to only run after connection
  // const [adapter, setAdapter] = useState<AptosWallet | null>(null);
  const [aptos, setAptos] = useState<Aptos | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    if (connected) {
      // const nightly = window.nightly?.aptos as AptosWallet;
      // // const nightlyAdapter = nightly?.standardWallet as AptosWallet;
      // console.log("nightlyAdapter", nightly);
      // setAdapter(nightly);

      const aptosConfig = new AptosConfig({
        network: Network.TESTNET,
        fullnode: "https://aptos.testnet.porto.movementlabs.xyz/v1",
      });
      setAptos(new Aptos(aptosConfig));
    }
  }, [connected]);

  useEffect(() => {
    const getNetwork = async () => {
      if (adapter?.network) {
        const network = await adapter.network();
        setNetworkInfo({
          name: network.name,
          chainId: network.chainId.toString(),
          url: network.url,
        });
      }
      if (adapter?.account) {
        const accountInfo = await adapter.account();
        // console.log("accountInfo", accountInfo);
        setAccountInfo(accountInfo as unknown as AccountInfo);
      }
    };

    getNetwork();
  }, [adapter]);

  const getBalance = useCallback(async () => {
    if (!adapter || !aptos) return;
    const account = await adapter.account();
    const balance = await doGetBalance(aptos, account.address.toString());
    toast({
      title: "balance",
      description: balance!.toString(),
    });
  }, [aptos, account]);

  const getBalanceByResourceWay = useCallback(async () => {
    if (!adapter || !aptos) return;
    const account = await adapter.account();
    const resp = await doGetBalanceByResourceWay(aptos, account.address.toString());
    toast({
      title: "balance by resource way",
      description: resp!.coin.value.toString(),
    });
  }, [aptos, account]);

  // Example usage within your component:
  const handleTransaction = useCallback(async () => {
    // Docs: https://docs.nightly.app/docs/aptos/solana/connect
    // console.log("info", account, adapter, aptos);
    if (!account?.address) return;
    const network = await adapter?.network();
    // optional: only works if the adapter supports network change.
    if (network?.chainId !== 177) {
      try {
        await adapter?.changeNetwork({ name: Network.TESTNET, chainId: 177 });
      } catch (error) {
        console.error("Failed to change network:", error);
      }
    }
    const aptosConfig = new AptosConfig({
      network: network?.name || Network.TESTNET,
    });
    const aptosClient = new Aptos(aptosConfig);
    const transaction: InputGenerateTransactionPayloadData = {
      function: "0x1::coin::transfer",
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
      functionArguments: [
        "0x960dbc655b847cad38b6dd056913086e5e0475abc27152b81570fd302cb10c38",
        100,
      ],
    };

    const userResponse = await signAndSubmitTransaction({
      payload: transaction,
    });

    if (userResponse.status !== UserResponseStatus.APPROVED) {
      throw new Error(userResponse.status);
    }
    // Confirm withdraw in backend
    const hash = (userResponse as unknown as { args: { hash: string } }).args
      .hash;
    try {
      await aptosClient.waitForTransaction({ transactionHash: hash });
    } catch (error) {
      console.error(error);
    }
    toast({
      title: userResponse.status,
      description: "This transaction has been " + userResponse.status,
    });
  }, [account]);

  return (
    <main className="flex flex-col w-full max-w-[1000px] p-6 pb-12 md:px-8 gap-6">
      <div className="flex justify-between items-center">
        <NavBar />
        <WalletButton />
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-4xl font-semibold tracking-tight">
          <center><h2>Move BuilderBoard</h2></center>
        </div>
        <div className="flex justify-center">
          <Image 
            // TODO: update the satofish to the better version.
            src={theme === 'light' ? "/assets/satofish.svg": "/assets/satofish_white.svg"} 
            alt="satofish" 
            width={100} 
            height={100} 
          />
        </div>
        <p className={`text-xs text-center ${theme === 'light' ? 'text-black': 'text-white-200'} mb-12`}>
          Hey, adventurer!😎 {" "}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <a className="text-day cursor-pointer underline">
                Add
              </a>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add Project</DialogTitle>
              </DialogHeader>
              <AddProjectForm />
            </DialogContent>
          </Dialog>
          {" "} your project to the builderboard.
        </p>

      </div>
      {connected && (
        <>
          <button
            onClick={getBalanceByResourceWay}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            // disabled={!connected || !adapter || !aptos}
          >
            Get Resource Example: Get Balance
          </button>

          <button
            onClick={getBalance}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            // disabled={!connected || !adapter || !aptos}
          >
            View Func Example: Get Balance
          </button>
          <button
            onClick={handleTransaction}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            // disabled={!connected || !adapter || !aptos}
          >
            Send Transaction Example: Transfer
          </button>
          <WalletConnection
            // account={
            //   {
            //     address: account?.address || "",
            //     publicKey: account?.publicKey || "",
            //     minKeysRequired: undefined,
            //     ansName: undefined,
            //   } as AccountInfo
            account={accountInfo}
            network={networkInfo}
            wallet={
              {
                name: adapter?.name || "",
                icon: adapter?.icon || "",
                url: "",
              } as WalletInfo
            }
          />
        </>
      )}
      {/* <div className="flex justify-between gap-6 pb-10">
        
        <div className="flex flex-col gap-2 md:gap-3">
          <h1 className="text-xl sm:text-3xl font-semibold tracking-tight">
            Scaffold Movement
            {network?.name ? ` — ${network.name}` : ""}
          </h1>
          <a
            href="https://github.com/aptos-labs/aptos-wallet-adapter/tree/main/apps/nextjs-example"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline underline-offset-2 font-medium leading-none"
          >
            Demo App Source Code
          </a>
        </div>
      </div> */}
      {/* {connected && isMainnet(connected, network?.name) && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            The transactions flows below will not work on the Mainnet network.
          </AlertDescription>
        </Alert>
      )} */}
      {connected && (
        <>
          <SingleSigner />
          {/* <TransactionParameters />
          <Sponsor />
          <MultiAgent /> */}
        </>
      )}
    </main>
  );
}

interface WalletConnectionProps {
  account: AccountInfo | null;
  network: NetworkInfo | null;
  wallet: WalletInfo | null;
}

function WalletConnection({ account, network, wallet }: WalletConnectionProps) {
  const isValidNetworkName = () => {
    if (network && isAptosNetwork(network)) {
      return Object.values<string | undefined>(Network).includes(network?.name);
    }
    return true;
  };

  const isNetworkChangeSupported = wallet?.name === "Nightly";
  
  // Add function to handle address conversion
  const getAddressString = () => {
    if (!account?.address) return null;
    
    try {
      if (typeof account.address === 'object' && 'data' in account.address) {
        const addressData = account.address.data;
        return Object.values(addressData)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      if (typeof account.address === 'string') {
        return account.address;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing address:', error);
      return null;
    }
  };

  const getPublicKeyString = () => {
    if (!account?.publicKey) return null;
    
    try {
      if (typeof account.publicKey === 'object' && 'key' in account.publicKey) {
        const keyData = account.publicKey.key.data;
        return Object.values(keyData)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      return null;
    } catch (error) {
      console.error('Error processing public key:', error);
      return null;
    }
  };

  const address = getAddressString();
  const publicKey = getPublicKeyString();

  const items = [
    {
      label: "Address",
      value: (
        <DisplayValue
          value={address ? "0x" + address : "Not Present"}
          isCorrect={!!address}
        />
      ),
    },
    {
      label: "Public key",
      value: (
        <DisplayValue
          value={publicKey ? "0x" + publicKey : "Not Present"}
          isCorrect={!!publicKey}
        />
      ),
    },
    {
      label: "ANS name",
      subLabel: "(only if attached)",
      value: "Not Present",
    },
    {
      label: "Min keys required",
      subLabel: "(only for multisig)",
      value: "Not Present",
    },
  ];

  // Debug logs
  // console.log('=== Debug Info ===');
  // console.log('Account:', JSON.stringify(account, null, 2));
  // console.log('Network:', JSON.stringify(network, null, 2));
  // console.log('Wallet:', JSON.stringify(wallet, null, 2));

  // console.log('Processed address:', address);
  // console.log('Processed publicKey:', publicKey);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-10 pt-6">
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Wallet Details</h4>
          <LabelValueGrid
            items={[
              {
                label: "Icon",
                value: wallet?.icon ? (
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={24}
                    height={24}
                  />
                ) : (
                  "Not Present"
                ),
              },
              {
                label: "Name",
                value: wallet?.name ?? "Not Present",
              },
              {
                label: "URL",
                value: wallet?.url ? (
                  <a
                    href={wallet.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-300"
                  >
                    {wallet.url}
                  </a>
                ) : (
                  "Not Present"
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Account Info</h4>
          <LabelValueGrid items={items} />
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Network Info</h4>
          <LabelValueGrid
            items={[
              {
                label: "Network name",
                value: (
                  <DisplayValue
                    value={network?.name ?? "Not Present"}
                    isCorrect={isValidNetworkName()}
                    expected={Object.values<string>(Network).join(", ")}
                  />
                ),
              },
              {
                label: "URL",
                value: network?.url ? (
                  <a
                    href={network.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-300"
                  >
                    {network.url}
                  </a>
                ) : (
                  "Not Present"
                ),
              },
              {
                label: "Chain ID",
                value: network?.chainId ?? "Not Present",
              },
            ]}
          />
        </div>

        {/* <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Change Network</h4>
          <RadioGroup
            value={network?.name}
            orientation="horizontal"
            className="flex gap-6"
            onValueChange={(value: Network) => changeNetwork(value)}
            disabled={!isNetworkChangeSupported}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Network.DEVNET} id="devnet-radio" />
              <Label htmlFor="devnet-radio">Devnet</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Network.TESTNET} id="testnet-radio" />
              <Label htmlFor="testnet-radio">Testnet</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Network.MAINNET} id="mainnet-radio" />
              <Label htmlFor="mainnet-radio">Mainnet</Label>
            </div>
          </RadioGroup>
          {!isNetworkChangeSupported && (
            <div className="text-sm text-red-600 dark:text-red-400">
              * {wallet?.name ?? "This wallet"} does not support network change
              requests
            </div>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
}
