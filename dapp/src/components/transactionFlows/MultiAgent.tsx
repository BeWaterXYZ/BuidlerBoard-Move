import { aptosClient, isSendableNetwork } from "@/lib/utils";
import {
  Account,
  AccountAuthenticator,
  AnyRawTransaction,
  Ed25519Account,
  Network,
} from "@aptos-labs/ts-sdk";
import { NetworkName, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { TransactionHash } from "../TransactionHash";
import { Button } from "../ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { LabelValueGrid } from "../LabelValueGrid";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { NetworkInfo, UserResponseStatus } from "@aptos-labs/wallet-standard";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

export function MultiAgent() {
  const { toast } = useToast();
  const {signTransaction, submitTransaction } =
    useWallet();
  const { connected, disconnect, account, adapter } =
    useAptosWallet();

  const [secondarySignerAccount, setSecondarySignerAccount] =
    useState<Ed25519Account>();
  const [transactionToSubmit, setTransactionToSubmit] =
    useState<AnyRawTransaction | null>(null);

  const [senderAuthenticator, setSenderAuthenticator] =
    useState<AccountAuthenticator>();
  const [secondarySignerAuthenticator, setSecondarySignerAuthenticator] =
    useState<AccountAuthenticator>();

  const [network, setNetwork] = useState<NetworkInfo | null>(null);

  // Add useEffect to fetch network info
  useEffect(() => {
    const fetchNetwork = async () => {
      if (adapter) {
        try {
          const networkInfo = await adapter.network();
          setNetwork(networkInfo);
        } catch (error) {
          console.error("Failed to fetch network:", error);
        }
      }
    };

    fetchNetwork();
  }, [adapter]);

  let sendable = isSendableNetwork(connected, network?.name);

  const generateTransaction = async (): Promise<AnyRawTransaction> => {
    if (!account) {
      throw new Error("no account");
    }
    if (!adapter) {
      throw new Error("no adapter");
    }
    if (!network) {
      throw new Error("no network");
    }

    const secondarySigner = Account.generate();

    await aptosClient({
      name: network.name as unknown as Network,
      url: network.url,
      chainId: network.chainId ?? 0,
    }).fundAccount({
      accountAddress: secondarySigner.accountAddress.toString(),
      amount: 100_000_000,
      options: { waitForIndexer: false },
    });
    setSecondarySignerAccount(secondarySigner);

    const transactionToSign = await aptosClient({
      name: network.name as unknown as Network,
      url: network.url,
      chainId: network.chainId ?? 0,
    }).transaction.build.multiAgent({
      sender: account.address,
      secondarySignerAddresses: [secondarySigner.accountAddress],
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [APTOS_COIN],
        functionArguments: [account.address, 1], // 1 is in Octas
      },
    });
    return transactionToSign;
  };

  const onSenderSignTransaction = async () => {
    const transaction = await generateTransaction();
    setTransactionToSubmit(transaction);
    try {
      const authenticator = await signTransaction(transaction);
      setSenderAuthenticator(authenticator);
    } catch (error) {
      console.error(error);
    }
  };

  const onSecondarySignerSignTransaction = async () => {
    if (!transactionToSubmit) {
      throw new Error("No Transaction to sign");
    }
    
    try {
      const authenticator = await signTransaction(transactionToSubmit);
      setSecondarySignerAuthenticator(authenticator);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmitTransaction = async () => {
    try {
      if (!transactionToSubmit) {
        throw new Error("No Transaction to sign");
      }
      if (!senderAuthenticator) {
        throw new Error("No senderAuthenticator");
      }
      if (!secondarySignerAuthenticator) {
        throw new Error("No secondarySignerAuthenticator");
      }
      const response = await submitTransaction({
        transaction: transactionToSubmit,
        senderAuthenticator: senderAuthenticator,
        additionalSignersAuthenticators: [secondarySignerAuthenticator],
      });
      toast({
        title: "Success",
        description: (
          <TransactionHash
            hash={response.hash}
            network={{
              name: network?.name as unknown as Network,
              url: network?.url,
              chainId: network?.chainId ?? 0,
            }}
          />
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to submit multiagent Transaction.",
      });
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi Agent Transaction Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-4">
          <Button onClick={onSenderSignTransaction} disabled={!sendable}>
            Sign as sender
          </Button>
          <Button
            onClick={onSecondarySignerSignTransaction}
            disabled={!sendable || !senderAuthenticator}
          >
            Sign as secondary signer
          </Button>
          <Button
            onClick={onSubmitTransaction}
            disabled={!sendable || !secondarySignerAuthenticator}
          >
            Submit transaction
          </Button>
        </div>

        {secondarySignerAccount && senderAuthenticator && (
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-medium">Secondary Signer details</h4>
            <LabelValueGrid
              items={[
                {
                  label: "Private Key",
                  value: secondarySignerAccount.privateKey.toString(),
                },
                {
                  label: "Public Key",
                  value: secondarySignerAccount.publicKey.toString(),
                },
                {
                  label: "Address",
                  value: secondarySignerAccount.accountAddress.toString(),
                },
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
