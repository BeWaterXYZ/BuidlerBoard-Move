import { isSendableNetwork, aptosClient } from "@/lib/utils";
import {
  parseTypeTag,
  AccountAddress,
  U64,
  Aptos,
  Network,
  AptosConfig,
  InputGenerateTransactionPayloadData,
  Ed25519PublicKey,
  Ed25519Signature,
} from "@aptos-labs/ts-sdk";

import { NetworkName, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { TransactionHash } from "../TransactionHash";
import { useEffect } from "react";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { useState } from "react";
import { NetworkInfo, UserResponseStatus } from "@aptos-labs/wallet-standard";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

export function SingleSigner() {
  const { toast } = useToast();
  // const {
  //   signAndSubmitTransaction,
  //   signMessageAndVerify,
  //   signMessage,
  //   signTransaction,
  // } = useWallet();
  const { signAndSubmitTransaction, signMessage, signTransaction } =
    useAptosWallet();

  const { connected, disconnect, account, adapter } = useAptosWallet();
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

  const onSignMessageAndVerify = async () => {
    if (!adapter) return;
    const account = await adapter.account();
    const payload = {
      message: "Hello from Movement Wallet Adapter",
      nonce: Math.random().toString(16),
    };
    const response = await adapter?.signMessage(payload) as unknown as {
      args: {
        signature: {
          data: {
            data: Uint8Array;
          };
        };
        address: string;
        application: string;
        chainId: string;
        message: string;
        nonce: string;
        fullMessage: string;
        status: string;
      };
    };
    // Format the response in a more readable way
    // console.log("response", response);
    const signature = Array.from(response.args.signature.data.data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    const formattedResponse = {
      onSignMessageAndVerify: {
        args: {
          prefix: "APTOS",
          signature: {
            // Convert byte array to hex string for better readability
            hex: signature,
          },
          address: response.args.address,
          application: response.args.application,
          chainId: response.args.chainId,
          message: response.args.message,
          nonce: response.args.nonce,
          fullMessage: response.args.fullMessage,
        },
        status: response.args.status
      }
    };

    const verified = account.publicKey.verifySignature({
      message: response.args.fullMessage,
      signature: new Ed25519Signature(signature),
    });
    // console.log("verified", verified);
    
    toast({
      title: "Success",
      description: (
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {JSON.stringify({
            message: response.args.message,
            signature: signature,
            verified: verified,
          }, null, 2)}
        </pre>
      ),
    });
  };

  const onSignMessage = async () => {
    if (!adapter) return;
    const account = await adapter.account();
    const payload = {
      message: "Hello from Movement Wallet Adapter",
      nonce: Math.random().toString(16),
    };
    const response = await adapter?.signMessage(payload) as unknown as {
      args: {
        signature: {
          data: {
            data: Uint8Array;
          };
        };
        address: string;
        application: string;
        chainId: string;
        message: string;
        nonce: string;
        fullMessage: string;
        status: string;
      };
    };
    // Format the response in a more readable way
    const signature = Array.from(response.args.signature.data.data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    const formattedResponse = {
      onSignMessage: {
        args: {
          prefix: "APTOS",
          signature: {
            // Convert byte array to hex string for better readability
            hex: signature,
          },
          address: response.args.address,
          application: response.args.application,
          chainId: response.args.chainId,
          message: response.args.message,
          nonce: response.args.nonce,
          fullMessage: response.args.fullMessage,
        },
        status: response.args.status
      }
    };
    toast({
      title: "Success",
      description: (
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {JSON.stringify(formattedResponse, null, 2)}
        </pre>
      ),
    });
  };

  const onSignAndSubmitTransaction = async () => {
    if (!account) return;
    // const transaction: InputTransactionData = {
    //   data: {
    //     function: "0x1::coin::transfer",
    //     typeArguments: [APTOS_COIN],
    //     functionArguments: [account.address, 1], // 1 is in Octas
    //   },
    // };
    console.log("network", network);
    const aptosConfig = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: "https://aptos.testnet.porto.movementlabs.xyz/v1",
    });

    const aptos = new Aptos(aptosConfig);
    console.log("aptos", aptos);
    const transaction = await aptos.transaction.build.simple({
      sender: account.address,
      data: {
        function: "0x1::coin::transfer",
        typeArguments: ["0x1::aptos_coin::AptosCoin"],
        functionArguments: [
          "0x960dbc655b847cad38b6dd056913086e5e0475abc27152b81570fd302cb10c38",
          100,
        ],
      },
    });
    console.log("transaction", transaction);

    // try {
    //   const response = await signAndSubmitTransaction(transaction);
    //   await aptosClient(network).waitForTransaction({
    //     transactionHash: response.hash,
    //   });
    //   toast({
    //     title: "Success",
    //     description: <TransactionHash hash={response.hash} network={network} />,
    //   });
    // } catch (error) {
    //   console.error(error);
    // }
  };

  const onSignAndSubmitBCSTransaction = async () => {
    if (!account) return;
    const payload: InputGenerateTransactionPayloadData = {
      function: "0x1::coin::transfer",
      typeArguments: [parseTypeTag(APTOS_COIN)],
      functionArguments: [AccountAddress.from(account.address), new U64(1)], // 1 is in Octas
    };
    try {
      const userResponse = await signAndSubmitTransaction({ payload });
      if (userResponse.status !== UserResponseStatus.APPROVED) {
        throw new Error(userResponse.status);
      }
      // Confirm withdraw in backend
      const hash = (userResponse as unknown as { args: { hash: string } }).args
        .hash;

      toast({
        title: "Success",
        description: (
          <TransactionHash
            hash={hash}
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

  // Legacy typescript sdk support
  // const onSignTransaction = async () => {
  //   try {
  //     const payload: InputGenerateTransactionPayloadData = {
  //       function: "0x1::coin::transfer",
  //       typeArguments: ["0x1::aptos_coin::AptosCoin"],
  //       functionArguments: [account?.address, 1], // 1 is in Octas
  //     };
  //     const response = await signTransaction(payload);
  //     toast({
  //       title: "Success",
  //       description: JSON.stringify(response),
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const onSignTransactionV2 = async () => {
    if (!account) return;

    try {
      const transactionToSign = await aptosClient({
        name: network?.name as unknown as Network,
        url: network?.url,
        chainId: network?.chainId ?? 0,
      }).transaction.build.simple({
        sender: account.address,
        data: {
          function: "0x1::coin::transfer",
          typeArguments: [APTOS_COIN],
          functionArguments: [account.address, 1], // 1 is in Octas
        },
      });
      const response = await signTransaction(transactionToSign);
      toast({
        title: "Success",
        description: JSON.stringify(response),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Msg Operations</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {/* <Button onClick={onSignAndSubmitTransaction} disabled={!sendable}>
          Sign and submit transaction
        </Button>
        <Button onClick={onSignAndSubmitBCSTransaction} disabled={!sendable}>
          Sign and submit BCS transaction
        </Button>
        <Button onClick={onSignTransaction} disabled={!sendable}>
          Sign transaction
        </Button>
        <Button onClick={onSignTransactionV2} disabled={!sendable}>
          Sign transaction V2
        </Button> */}
        <Button onClick={onSignMessage}>Sign message</Button>
        <Button onClick={onSignMessageAndVerify}>
          Sign message and verify
        </Button>
      </CardContent>
    </Card>
  );
}
