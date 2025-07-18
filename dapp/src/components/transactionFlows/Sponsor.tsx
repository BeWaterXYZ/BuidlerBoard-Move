import { aptosClient, isSendableNetwork } from "@/lib/utils";
import {
  Account,
  AccountAuthenticator,
  AnyRawTransaction,
  Network,
} from "@aptos-labs/ts-sdk";
import { NetworkName, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { TransactionHash } from "../TransactionHash";
import { Button } from "../ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { NetworkInfo } from "@aptos-labs/wallet-standard";
import { useEffect } from "react";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

export function Sponsor() {
  const { toast } = useToast();
  const { signTransaction, submitTransaction } = useWallet();
  const { connected, account, adapter } = useAptosWallet();
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
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
  const [transactionToSubmit, setTransactionToSubmit] =
    useState<AnyRawTransaction | null>(null);

  const [senderAuthenticator, setSenderAuthenticator] =
    useState<AccountAuthenticator>();
  const [feepayerAuthenticator, setFeepayerAuthenticator] =
    useState<AccountAuthenticator>();

  let sendable = isSendableNetwork(connected, network?.name);

  // create sponsor account
  const SPONSOR_INITIAL_BALANCE = 100_000_000;
  const sponsor = Account.generate();

  // Generate a raw transaction using the SDK
  const generateTransaction = async (): Promise<AnyRawTransaction> => {
    if (!account) {
      throw new Error("no account");
    }
    const transactionToSign = await aptosClient({
      name: network?.name as unknown as Network,
      url: network?.url,
      chainId: network?.chainId ?? 0,
    }).transaction.build.simple({
      sender: account.address,
      withFeePayer: true,
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [APTOS_COIN],
        functionArguments: [account.address, 1], // 1 is in Octas
      },
    });
    return transactionToSign;
  };

  const onSignTransaction = async () => {
    const transaction = await generateTransaction();
    setTransactionToSubmit(transaction);

    try {
      const authenticator = await signTransaction(transaction);
      setSenderAuthenticator(authenticator);
    } catch (error) {
      console.error(error);
    }
  };

  const onSignTransactionAsSponsor = async () => {
    if (!transactionToSubmit) {
      throw new Error("No Transaction to sign");
    }
    try {
      await aptosClient({
        name: network?.name as unknown as Network,
        url: network?.url,
        chainId: network?.chainId ?? 0,
      }).fundAccount({
        accountAddress: sponsor.accountAddress,
        amount: SPONSOR_INITIAL_BALANCE,
      });
      const authenticator = await aptosClient({
        name: network?.name as unknown as Network,
        url: network?.url,
        chainId: network?.chainId ?? 0,
      }).transaction.signAsFeePayer({
        signer: sponsor,
        transaction: transactionToSubmit,
      });
      setFeepayerAuthenticator(authenticator);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmitTransaction = async () => {
    if (!transactionToSubmit) {
      throw new Error("No Transaction to sign");
    }
    if (!senderAuthenticator) {
      throw new Error("No senderAuthenticator");
    }
    if (!feepayerAuthenticator) {
      throw new Error("No feepayerAuthenticator");
    }
    try {
      const response = await submitTransaction({
        transaction: transactionToSubmit,
        senderAuthenticator: senderAuthenticator,
        feePayerAuthenticator: feepayerAuthenticator,
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
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsor Transaction Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button onClick={onSignTransaction} disabled={!sendable}>
          Sign as sender
        </Button>
        <Button
          onClick={onSignTransactionAsSponsor}
          disabled={!sendable || !senderAuthenticator}
        >
          Sign as sponsor
        </Button>
        <Button
          onClick={onSubmitTransaction}
          disabled={!sendable || !senderAuthenticator}
        >
          Submit transaction
        </Button>
      </CardContent>
    </Card>
  );
}
