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
import { Switch } from "@/components/ui/switch";

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

const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS;
const DAPP_NAME = process.env.NEXT_PUBLIC_DAPP_NAME;
const APTOS_NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL;

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

// Update the Hackathon interface
interface Hackathon {
  unique_id: number;  // Changed from id to unique_id
  name: string;
  description: string;
  start_date: number;
  end_date: number;
  owner: string;
  judges: string[];
  winners: string[];
  comments: string[];
  projects: string[];
}

// Add these interfaces after the existing interfaces
interface Project {
  unique_id: number;
  name: string;
  description: string;
  url: string;
  category: string;
  github_url: string;
  demo_url: string;
  deck_url: string;
  intro_video_url: string;
  owner: string;
  rank?: number;
  stars?: number;
}

// Mock Data for Dev.
// const MOCK_HACKATHONS: Hackathon[] = [
//   {
//     name: "Web3 Builders Hackathon",
//     description: "A hackathon focused on building the next generation of Web3 applications",
//     start_date: 1714521600, // May 1, 2024
//     end_date: 1717200000, // June 1, 2024
//     owner: "0x3fb7233a48d6f0a8c50e1d1861521790af0c5d7cfaf95ec81dc5bed4541becf1"
//   },
//   {
//     name: "AI & Blockchain Fusion",
//     description: "Exploring the intersection of AI and blockchain technology",
//     start_date: 1717200000, // June 1, 2024
//     end_date: 1719792000, // July 1, 2024
//     owner: "0x3fb7233a48d6f0a8c50e1d1861521790af0c5d7cfaf95ec81dc5bed4541becf1"
//   },
//   {
//     name: "DeFi Innovation Challenge",
//     description: "Building the future of decentralized finance",
//     start_date: 1719792000, // July 1, 2024
//     end_date: 1722470400, // August 1, 2024
//     owner: "0x3fb7233a48d6f0a8c50e1d1861521790af0c5d7cfaf95ec81dc5bed4541becf1"
//   },
//   {
//     name: "Web3 Builders Hackathon",
//     description: "A hackathon focused on building the next generation of Web3 applications",
//     start_date: 1714521600, // May 1, 2024
//     end_date: 1717200000, // June 1, 2024
//     owner: "0x3fb7233a48d6f0a8c50e1d1861521790af0c5d7cfaf95ec81dc5bed4541becf1"
//   },
// ];

// Add this component before the HackathonCard component
function AddJudgesDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (addresses: string[]) => void;
}) {
  const [addresses, setAddresses] = useState<string[]>(['']);
  const { theme } = useTheme();

  const handleAddAddress = () => {
    setAddresses([...addresses, '']);
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const handleSubmit = () => {
    // Filter out empty addresses
    const validAddresses = addresses.filter(addr => addr.trim() !== '');
    onSubmit(validAddresses);
    onOpenChange(false);
    setAddresses(['']); // Reset form
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Add Judges</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {addresses.map((address, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={address}
                onChange={(e) => handleAddressChange(index, e.target.value)}
                placeholder="Enter judge's address"
                className="flex-1"
              />
              {addresses.length > 1 && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveAddress(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleAddAddress}
            className="mt-2"
          >
            Add Another Judge
          </Button>
          <Button onClick={handleSubmit} className="mt-4">
            Submit Judges
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add this helper function before the HackathonCard component
function CopyableAddress({ address }: { address: string }) {
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Copy full address"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </button>
    </div>
  );
}

// Add this component before the HackathonCard component
function ProjectDetailsDialog({ 
  project, 
  isOpen, 
  onOpenChange 
}: { 
  project: Project | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { theme } = useTheme();

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{project.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-medium mb-2">Category</h3>
            <span className="px-2 py-1 bg-[#1E293B] rounded-[4px] text-sm text-[#F8FAFC]">
              {project.category}
            </span>
          </div>
          <div>
            <h3 className="font-medium mb-2">Links</h3>
            <div className="flex flex-wrap gap-2">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Website
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  GitHub
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Demo
                </a>
              )}
              {project.deck_url && (
                <a
                  href={project.deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Deck
                </a>
              )}
              {project.intro_video_url && (
                <a
                  href={project.intro_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Video
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Owner</h3>
            <CopyableAddress address={project.owner} />
          </div>
          {project.stars !== undefined && (
            <div>
              <h3 className="font-medium mb-2">GitHub Stars</h3>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                ⭐ {project.stars}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Update the HackathonCard component
function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const { theme } = useTheme();
  const [isAddJudgesOpen, setIsAddJudgesOpen] = useState(false);
  const { signAndSubmitTransaction } = useAptosWallet();
  const { toast } = useToast();
  const [aptos, setAptos] = useState<Aptos | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const { adapter } = useAptosWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [winningProjects, setWinningProjects] = useState<Project[]>([]);
  const [isLoadingWinningProjects, setIsLoadingWinningProjects] = useState(false);
  const [isAddWinnersOpen, setIsAddWinnersOpen] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [winnerComments, setWinnerComments] = useState<string[]>([]);
  
  // Add useEffect to initialize aptos client
  useEffect(() => {
    const aptosConfig = new AptosConfig({
      network: Network.TESTNET,
      fullnode: APTOS_NODE_URL,
    });
    setAptos(new Aptos(aptosConfig));
  }, []);

  // Add useEffect to get account info
  useEffect(() => {
    const getAccount = async () => {
      if (adapter?.account) {
        const accountInfo = await adapter.account();
        setAccountInfo(accountInfo as unknown as AccountInfo);
      }
    };
    getAccount();
  }, [adapter]);

  // Add useEffect to fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (aptos) {
        try {
          const fetchedProjects = await doGetProjects(aptos);
          setProjects(fetchedProjects);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };

    fetchProjects();
  }, [aptos]);

  // Add useEffect to fetch winning project details
  useEffect(() => {
    const fetchWinningProjects = async () => {
      if (aptos && hackathon.winners.length > 0) {
        setIsLoadingWinningProjects(true);
        try {
          // Fetch winning project details for each winner
          const winningProjectPromises = hackathon.winners.map(winnerId => 
            doGetProject(aptos, parseInt(winnerId))
          );
          
          const winningProjectResults = await Promise.all(winningProjectPromises);
          const validWinningProjects = winningProjectResults.filter(project => project !== null) as Project[];
          
          setWinningProjects(validWinningProjects);
        } catch (error) {
          console.error("Error fetching winning projects:", error);
        } finally {
          setIsLoadingWinningProjects(false);
        }
      } else {
        setWinningProjects([]);
      }
    };

    fetchWinningProjects();
  }, [aptos, hackathon.winners]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddJudges = async (addresses: string[]) => {
    try {
      // Convert addresses to the correct format (remove 0x prefix if present)
      const formattedAddresses = addresses.map(addr => 
        addr.startsWith('0x') ? addr.slice(2) : addr
      );

      const transaction: InputGenerateTransactionPayloadData = {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::add_judges`,
        typeArguments: [],
        functionArguments: [
          hackathon.unique_id,
          formattedAddresses
        ],
      };

      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });

      if (userResponse.status !== UserResponseStatus.APPROVED) {
        throw new Error(userResponse.status);
      }

      // Wait for transaction to be confirmed
      const hash = (userResponse as unknown as { args: { hash: string } }).args.hash;
      if (aptos) {
        await aptos.waitForTransaction({ transactionHash: hash });
      }

      toast({
        title: "Success",
        description: "Judges added successfully!",
      });

      // Refresh the hackathon list
      if (aptos) {
        const fetchedHackathons = await doGetHackathons(aptos);
        // Update the parent component's hackathons state
        const event = new CustomEvent('hackathonsUpdated', { detail: fetchedHackathons });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error adding judges:', error);
      toast({
        title: "Error",
        description: "Failed to add judges. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddWinners = async () => {
    if (selectedWinners.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one winner",
        variant: "destructive",
      });
      return;
    }

    try {
      const transaction: InputGenerateTransactionPayloadData = {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::add_winners`,
        typeArguments: [],
        functionArguments: [
          hackathon.unique_id,
          selectedWinners,
          winnerComments
        ],
      };

      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });

      if (userResponse.status !== UserResponseStatus.APPROVED) {
        throw new Error(userResponse.status);
      }

      // Wait for transaction to be confirmed
      const hash = (userResponse as unknown as { args: { hash: string } }).args.hash;
      if (aptos) {
        await aptos.waitForTransaction({ transactionHash: hash });
      }

      toast({
        title: "Success",
        description: "Winners added successfully!",
      });

      // Close dialog and reset state
      setIsAddWinnersOpen(false);
      setSelectedWinners([]);
      setWinnerComments([]);

      // Refresh the hackathon list
      if (aptos) {
        const fetchedHackathons = await doGetHackathons(aptos);
        // Update the parent component's hackathons state
        const event = new CustomEvent('hackathonsUpdated', { detail: fetchedHackathons });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error adding winners:', error);
      toast({
        title: "Error",
        description: "Failed to add winners. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{hackathon.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
            {hackathon.description}
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-xs">Start Date</p>
              <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
                
                {formatDate(hackathon.start_date)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs">End Date</p>
              <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
                {formatDate(hackathon.end_date)}
              </p>
            </div>
          </div>
          <div className="pt-2">
            <p className="font-semibold text-s">Owner</p>
            <div className="flex items-center gap-2">
              <CopyableAddress address={hackathon.owner} />
              {accountInfo && `0x${getAddressString(accountInfo)}` === hackathon.owner && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                  👤 You
                </span>
              )}
            </div>
          </div>
          {/* Show judges, projects, winners and comments */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-s">Judges</p>
            <div className="space-y-1">
                {/* Show not yet if judges is empty */}
              {hackathon.judges.length === 0 ? (
                <p className="text-xs text-gray-500">Not yet</p>
              ) : (
                hackathon.judges.map((judge) => {
                  const isCurrentUser = accountInfo && 
                    `0x${getAddressString(accountInfo)}` === judge;
                  return (
                    <div key={judge} className="flex items-center gap-2">
                      <CopyableAddress address={judge} />
                      {isCurrentUser && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          👤 You
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-s">Projects</p>
            <div className="space-y-1"> 
                {/* Show not yet if projects is empty */}
              {hackathon.projects.length === 0 ? (
                <p className="text-xs text-gray-500">Not yet</p>
              ) : (
                hackathon.projects.map((projectId) => {
                  const project = projects.find(p => p.unique_id.toString() === projectId);
                  return (
                    <div key={projectId} className="flex items-center justify-between">
                      <span className="text-sm">{project ? project.name : 'Loading...'}</span>
                      <button 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        onClick={() => {
                          if (project) {
                            setSelectedProject(project);
                            setIsProjectDetailsOpen(true);
                          }
                        }}
                        disabled={!project}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-s">🏆 Winners and Comments</p>
            <div className="space-y-1">
              {hackathon.winners.length === 0 ? (
                <p className="text-xs text-gray-500">Not yet</p>
              ) : isLoadingWinningProjects ? (
                <p className="text-xs text-gray-500">Loading winners...</p>
              ) : winningProjects.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          Winner
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          Comment
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {winningProjects.map((project, index) => (
                        <tr key={project.unique_id} className="bg-white dark:bg-gray-900">
                          <td className="px-3 py-2">
                            <div>
                              <p className="font-medium text-green-600 dark:text-green-400">
                                🏆 {project.name}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                ID: {project.unique_id}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <p className="text-gray-700 dark:text-gray-300">
                              {hackathon.comments[index] || 'No comment'}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <button 
                              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsProjectDetailsOpen(true);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No winning projects found</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">     
            <Button onClick={() => setIsAddJudgesOpen(true)}>Add Judges</Button>
            <Button onClick={() => setIsAddWinnersOpen(true)}>Add Winners and Comments</Button>
          </div>
        </div>
      </CardContent>
      <AddJudgesDialog
        isOpen={isAddJudgesOpen}
        onOpenChange={setIsAddJudgesOpen}
        onSubmit={handleAddJudges}
      />
      <ProjectDetailsDialog
        project={selectedProject}
        isOpen={isProjectDetailsOpen}
        onOpenChange={setIsProjectDetailsOpen}
      />
      <AddWinnersDialog
        isOpen={isAddWinnersOpen}
        onOpenChange={setIsAddWinnersOpen}
        onSubmit={handleAddWinners}
        projects={projects}
        selectedWinners={selectedWinners}
        setSelectedWinners={setSelectedWinners}
        winnerComments={winnerComments}
        setWinnerComments={setWinnerComments}
      />
    </Card>
  );
}

// Add Winners Dialog Component
function AddWinnersDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  projects,
  selectedWinners,
  setSelectedWinners,
  winnerComments,
  setWinnerComments
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  projects: Project[];
  selectedWinners: number[];
  setSelectedWinners: (winners: number[]) => void;
  winnerComments: string[];
  setWinnerComments: (comments: string[]) => void;
}) {
  const handleWinnerToggle = (projectId: number) => {
    if (selectedWinners.includes(projectId)) {
      setSelectedWinners(selectedWinners.filter(id => id !== projectId));
      // Remove corresponding comment
      const index = selectedWinners.indexOf(projectId);
      const newComments = [...winnerComments];
      newComments.splice(index, 1);
      setWinnerComments(newComments);
    } else {
      setSelectedWinners([...selectedWinners, projectId]);
      setWinnerComments([...winnerComments, '']);
    }
  };

  const handleCommentChange = (projectId: number, comment: string) => {
    const index = selectedWinners.indexOf(projectId);
    if (index !== -1) {
      const newComments = [...winnerComments];
      newComments[index] = comment;
      setWinnerComments(newComments);
    }
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🏆 Add Winners and Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="font-medium">Select Winners:</h4>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.unique_id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id={`winner-${project.unique_id}`}
                      checked={selectedWinners.includes(project.unique_id)}
                      onChange={() => handleWinnerToggle(project.unique_id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`winner-${project.unique_id}`}
                        className="font-medium cursor-pointer"
                      >
                        {project.name}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {project.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No projects available</p>
              )}
            </div>
          </div>

          {/* Winners and Comments Table */}
          {selectedWinners.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">🏆 Winners and Comments:</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Winner
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comment
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedWinners.map((winnerId, index) => {
                      const project = projects.find(p => p.unique_id === winnerId);
                      return (
                        <tr key={winnerId} className="bg-white dark:bg-gray-900">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">{project?.name || `Project ${winnerId}`}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {winnerId}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <textarea
                              value={winnerComments[index] || ''}
                              onChange={(e) => handleCommentChange(winnerId, e.target.value)}
                              placeholder="Add a comment for this winner..."
                              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              rows={2}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleWinnerToggle(winnerId)}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={selectedWinners.length === 0}
              className="flex-1"
            >
              Add Winners
            </Button>
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add this helper function before the Home component
function getAddressString(account: AccountInfo | null): string | null {
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
}

// Add this function after the doGetBalance function
async function doGetHackathons(aptos: Aptos, _accountAddress?: string) {
    console.log("func", `${DAPP_ADDRESS}::${DAPP_NAME}::get_hackathons`);
  try {
    const [hackathons] = await aptos.view({
      payload: {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::get_hackathons`,
        typeArguments: [],
        functionArguments: [],
      },
    });
    console.log("hackathons", hackathons);
    return hackathons as Hackathon[];
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    return [];
  }
}

// Add this function after doGetHackathons
async function doGetProjects(aptos: Aptos) {
  try {
    const [projects] = await aptos.view({
      payload: {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::get_projects`,
        typeArguments: [],
        functionArguments: [],
      },
    });
    return projects as Project[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Add function to get individual project by unique_id
async function doGetProject(aptos: Aptos, projectId: number) {
  try {
    const [project] = await aptos.view({
      payload: {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::get_project`,
        typeArguments: [],
        functionArguments: [projectId],
      },
    });
    return project as Project;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    return null;
  }
}

export default function Home() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [showMyHackathonsOnly, setShowMyHackathonsOnly] = useState(false);

  // Add event listener for hackathon updates
  useEffect(() => {
    const handleHackathonsUpdate = (event: CustomEvent<Hackathon[]>) => {
      setHackathons(event.detail);
    };

    window.addEventListener('hackathonsUpdated', handleHackathonsUpdate as EventListener);

    return () => {
      window.removeEventListener('hackathonsUpdated', handleHackathonsUpdate as EventListener);
    };
  }, []);

  const handleAddHackathon = () => {
    setIsDialogOpen(true);
  };

  const { connected, disconnect, account, signAndSubmitTransaction, adapter } =
    useAptosWallet();
  const [accountInfo, setAccountInfo] = useState<AccountInfo| null>(null);
  const [aptos, setAptos] = useState<Aptos | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    // Initialize aptos client regardless of wallet connection
    const aptosConfig = new AptosConfig({
      network: Network.TESTNET,
      fullnode: APTOS_NODE_URL,
    });
    setAptos(new Aptos(aptosConfig));
  }, []);

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
  
  // Add this useEffect to fetch hackathons when connected
  useEffect(() => {
    const fetchHackathons = async () => {
      if (aptos) {
        try {
          const fetchedHackathons = await doGetHackathons(aptos, "");
          console.log("fetchedHackathons", fetchedHackathons);
          setHackathons(fetchedHackathons);
        } catch (error) {
          console.error("Error fetching hackathons:", error);
          setHackathons([]);
        }
      }
    };

    fetchHackathons();
  }, [aptos]);

  // Filter hackathons based on switch state
  useEffect(() => {
    if (hackathons.length > 0) {
      if (showMyHackathonsOnly && accountInfo) {
        const currentAddress = getAddressString(accountInfo);
        if (currentAddress) {
          const walletAddress = `0x${currentAddress}`;
          const filtered = hackathons.filter(hackathon => 
            hackathon.owner === walletAddress || 
            hackathon.judges.includes(walletAddress)
          );
          setFilteredHackathons(filtered);
        } else {
          setFilteredHackathons([]);
        }
      } else {
        // Show all hackathons
        setFilteredHackathons(hackathons);
      }
    } else {
      setFilteredHackathons([]);
    }
  }, [hackathons, accountInfo, showMyHackathonsOnly]);

  const handleSubmit = useCallback(async () => {
    if (!account?.address) return;
    const network = await adapter?.network();
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

    // Convert datetime-local values to Unix timestamps
    const start_date = Math.floor(new Date(startTime).getTime() / 1000);
    const end_date = Math.floor(new Date(endTime).getTime() / 1000);

    const transaction: InputGenerateTransactionPayloadData = {
      function: `${DAPP_ADDRESS}::${DAPP_NAME}::add_hackathon`,
      typeArguments: [],
      functionArguments: [
        name,
        description,
        start_date,
        end_date
      ],
    };

    const userResponse = await signAndSubmitTransaction({
      payload: transaction,
    });

    if (userResponse.status !== UserResponseStatus.APPROVED) {
      throw new Error(userResponse.status);
    }
    const hash = (userResponse as unknown as { args: { hash: string } }).args.hash;
    try {
      await aptosClient.waitForTransaction({ transactionHash: hash });
      toast({
        title: "Success",
        description: "Hackathon added successfully!",
      });
      // refresh the hackathon list
      if (aptos && accountInfo) {
        const currentAddress = getAddressString(accountInfo);
        if (currentAddress) {
          const fetchedHackathons = await doGetHackathons(aptos, `0x${currentAddress}`);
          setHackathons(fetchedHackathons);
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add hackathon. Please try again.",
        variant: "destructive",
      });
    }
  }, [account, name, description, startTime, endTime]);

  return (
    <main className="flex flex-col w-full max-w-[1333px] mx-auto p-6 pb-12 md:px-8 gap-6">
      <div className="flex justify-between items-center w-full">
        <NavBar />
        <WalletButton />
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-4xl font-semibold tracking-tight text-center">
            {/* HINT: not modify the text */}
          <h2>Hackath0n Gallery</h2>
        </div>
        <div className="flex justify-center">
          <Image 
            src={theme === 'light' ? "/assets/satofish.svg": "/assets/satofish_white.svg"} 
            alt="satofish" 
            width={100} 
            height={100} 
            className="object-contain"
          />
        </div>
        <p className={`text-xl text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mb-12`}>
          How about {" "}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {/* HINT: not modify the text */}
                👉 Hodl 👈
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">Create Hackathon</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter hackathon name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter hackathon description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <Button onClick={handleSubmit}>Create Hackathon</Button>
              </div>
            </DialogContent>
          </Dialog>
          {" "} a fully-on-chain hackathon?
        </p>
      </div>

      {/* Update the hackathon gallery to use filtered hackathons */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Show All</span>
          <Switch
            checked={showMyHackathonsOnly}
            onCheckedChange={setShowMyHackathonsOnly}
          />
          <span className="text-sm font-medium">My Hackathons Only</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredHackathons.length > 0 ? (
          filteredHackathons.map((hackathon, index) => (
            <HackathonCard key={index} hackathon={hackathon} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {showMyHackathonsOnly ? 
                (connected ? 
                  "No hackathons found where you are the owner or judge." : 
                  "Please connect your wallet to view your hackathons."
                ) : 
                "No hackathons found. Connect your wallet to create the first hackathon!"
              }
            </p>
          </div>
        )}
      </div>
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

  const address = getAddressString(account);
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
    </Card>
  );
}
