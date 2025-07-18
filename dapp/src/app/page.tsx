"use client";

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
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import axios from 'axios';

// Imports for registering a browser extension wallet plugin on page load
// import { MyWallet } from "@/utils/standardWallet";
// import { registerWallet } from "@aptos-labs/wallet-standard";

import { NavBar } from "@/components/NavBar";

import { AptosWallet, ReadonlyUint8Array, UserResponseStatus } from "@aptos-labs/wallet-standard";

import { WalletButton } from "@/components/wallet/WalletButton";
import { WalletSelector as ShadcnWalletSelector } from "@/components/WalletSelector";
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

// Update the Hackathon interface to include projects and winners
interface Hackathon {
  unique_id: number;
  name: string;
  description: string;
  start_date: number;
  end_date: number;
  projects: number[]; // Array of project unique_ids
  winners: number[]; // Array of winning project unique_ids
}

// Add this function after the existing functions
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

// Add this function after doGetProjects
async function doGetHackathons(aptos: Aptos) {
  try {
    const [hackathons] = await aptos.view({
      payload: {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::get_hackathons`,
        typeArguments: [],
        functionArguments: [],
      },
    });
    return hackathons as Hackathon[];
  } catch (error) {
    console.error("Error fetching hackathons:", error);
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

// Update the ProjectCard component
function ProjectCard({ 
  project, 
  accountInfo,
  hackathons,
  onUpdateClick,
  onApplyClick,
  onDonateClick,
  onHackathonClick
}: { 
  project: Project; 
  accountInfo: AccountInfo | null;
  hackathons: Hackathon[];
  onUpdateClick: (project: Project) => void;
  onApplyClick: (project: Project) => void;
  onDonateClick: (project: Project) => void;
  onHackathonClick: (hackathon: Hackathon) => void;
}) {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
      duration: 2000,
    });
  };

  // Get hackathons where this project is a winner
  const getWinningHackathons = () => {
    return hackathons.filter(hackathon => 
      hackathon.winners.includes(project.unique_id)
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_0.1fr)_minmax(0,_0.45fr)_minmax(0,_0.22fr)_minmax(0,_0.45fr)_minmax(0,_0.2fr)_minmax(0,_1fr)_minmax(0,_0.2fr)_minmax(0,_0.3fr)] gap-2 md:gap-4 border-b border-b-[#334155] py-4 items-start md:items-center text-xs text-[#F8FAFC]">
      {/* Rank */}
      <p className="text-base hidden md:block"># {project.rank}</p>

      {/* Project Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="md:hidden text-base">#{project.unique_id}</span>
          <a 
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm md:text-base text-[#F8FAFC] hover:underline"
          >
            {project.name}
          </a>
        </div>
        <p className="text-xs md:text-sm text-[#94A3B8] line-clamp-2">
          {project.description}
        </p>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <span className="px-2 py-1 bg-[#1E293B] rounded-[4px] text-s text-[#F8FAFC] inline-block">
          <center>{project.category}</center>
        </span>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <div className="flex flex-wrap gap-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-s text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              GitHub
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-s text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Demo
            </a>
          )}
          {project.deck_url && (
            <a
              href={project.deck_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-s text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Deck
            </a>
          )}
        </div>
      </div>

      {/* Video */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0 items-center justify-center">
        <center>
        {project.intro_video_url && (
          <a
            href={project.intro_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#94A3B8] hover:text-[#F8FAFC]"
            title="Watch Video"
          >
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        )}
        </center>
      </div>

      {/* Owner */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(project.owner)}
            className="text-s text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer text-left w-1/5"
            title="Click to copy address"
          >
            {`${project.owner.slice(0, 6)}...${project.owner.slice(-4)}`}
            {accountInfo && project.owner === accountInfo.address.toString() && (
              <span className="text-s text-[#94A3B8]"><b>[Me]</b></span>
            )}
          </button>
          &nbsp; &nbsp; &nbsp; &nbsp;
          {accountInfo && project.owner === accountInfo.address.toString() && (
            <button 
              className="text-s text-white bg-orange-500 hover:bg-orange-700 cursor-pointer text-left w-1/3"
              onClick={() => onApplyClick(project)}
            > 
              <center>😎👉 Apply Hackathon!</center>
            </button>
          )}
          &nbsp; &nbsp; &nbsp; &nbsp;
          {accountInfo && project.owner === accountInfo.address.toString() && (
            <button 
              className="text-s text-white bg-green-500 hover:bg-green-700 cursor-pointer text-left w-1/4"
              onClick={() => onUpdateClick(project)}
            >
              <center>Update Project</center>
            </button>
          )}
        </div>
      </div>

      {/* Donate */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0 items-center justify-center">
        <button
          onClick={() => onDonateClick(project)}
          className="text-s text-white bg-purple-500 hover:bg-purple-700 cursor-pointer px-3 py-1 rounded"
          title="Click to donate APT to the project owner"
        >
          <center>😘 Donate</center>
        </button>
      </div>

      {/* Hackathon Joined */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0 items-center justify-center">
        {(() => {
          const winningHackathons = getWinningHackathons();
          if (winningHackathons.length > 0) {
            return (
              <div className="flex flex-col gap-1">
                {winningHackathons.map((hackathon) => (
                  <button
                    key={hackathon.unique_id}
                    onClick={() => onHackathonClick(hackathon)}
                    className="text-xs text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700 cursor-pointer transition-colors"
                    title={`Click to view ${hackathon.name} details`}
                  >
                    <center>🏆 {hackathon.name}</center>
                  </button>
                ))}
              </div>
            );
          } else {
            return (
              <span className="text-s text-[#94A3B8]">
                <center>No wins yet</center>
              </span>
            );
          }
        })()}
      </div>

      
    </div>
  );
}

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
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState<Project | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isApplyHackathonDialogOpen, setIsApplyHackathonDialogOpen] = useState(false);
  const [selectedProjectForHackathon, setSelectedProjectForHackathon] = useState<Project | null>(null);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [selectedProjectForDonation, setSelectedProjectForDonation] = useState<Project | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isHackathonInfoDialogOpen, setIsHackathonInfoDialogOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [winningProjects, setWinningProjects] = useState<Project[]>([]);
  const [isLoadingWinningProjects, setIsLoadingWinningProjects] = useState(false);

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

  // In the Home component, add this state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Add these state variables in the Home component
  const [searchAddress, setSearchAddress] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const [rankAlgorithm, setRankAlgorithm] = useState("0x9e0d5b6616485c40ce93f66e586a73cc433b63d36769554c36a57208b4aa440f::rankor_only_star");

  // Add state for hackathon projects
  const [hackathonProjects, setHackathonProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (connected) {
      // const nightly = window.nightly?.aptos as AptosWallet;
      // // const nightlyAdapter = nightly?.standardWallet as AptosWallet;
      // console.log("nightlyAdapter", nightly);
      // setAdapter(nightly);

      const aptosConfig = new AptosConfig({
        network: Network.TESTNET,
        fullnode: APTOS_NODE_URL,
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

  // Add this useEffect to fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        // Create Aptos instance regardless of wallet connection
        const aptosConfig = new AptosConfig({
          network: Network.TESTNET,
          fullnode: APTOS_NODE_URL,
        });
        const aptosClient = new Aptos(aptosConfig);
        
        const fetchedProjects = await doGetProjects(aptosClient);
        console.log("fetchedProjects", fetchedProjects);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []); // Remove aptos dependency to run on component mount

  // Add this useEffect to handle filtering
  useEffect(() => {
    if (searchAddress) {
      const filtered = projects.filter(project => 
        project.owner.toLowerCase().includes(searchAddress.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchAddress, projects]);

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

  const fetchGitHubStars = async (url: string) => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${url}`);
      return response.data.stargazers_count;
    } catch (error) {
      console.error('Error fetching GitHub stars:', error);
      return 0;
    }
  };

  const handleRankProjects = async () => {
    const projectsWithStars = await Promise.all(
      projects.map(async (project) => {
        const stars = project.github_url ? await fetchGitHubStars(project.github_url.replace('https://github.com/', '')) : 0;
        return { ...project, stars };
      })
    );

    const rankedProjects = projectsWithStars.sort((a, b) => b.stars - a.stars).map((project, index) => ({
      ...project,
      rank: index + 1,
    }));
    console.log("rankedProjects", rankedProjects);
    setFilteredProjects(rankedProjects);
  };

  const handleUpdateProject = async (
    unique_id: number,
    name: string,
    category: string,
    githubUrl: string,
    demoUrl: string,
    deckUrl: string,
    introVideoUrl: string
  ) => {
    try {
      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(aptosConfig);

      const transaction: InputGenerateTransactionPayloadData = {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::update_project`,
        typeArguments: [],
        functionArguments: [
          unique_id,
          name,
          category,
          githubUrl,
          demoUrl,
          deckUrl,
          introVideoUrl
        ],
      };

      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });
      console.log("userResponse", userResponse);
      if (userResponse.status === "Approved") {
        await aptos.waitForTransaction({ transactionHash: userResponse.args.hash });
        toast({
          title: "Success",
          description: "Project updated successfully!",
        });
        setIsUpdateDialogOpen(false);
        // Refresh the projects list
        const fetchedProjects = await doGetProjects(aptos);
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateButtonClick = (project: Project) => {
    setProjectToUpdate(project);
    setIsUpdateDialogOpen(true);
  };

  const handleApplyToHackathon = async (hackathonId: number) => {
    if (!selectedProjectForHackathon) return;
    
    try {
      const transaction: InputGenerateTransactionPayloadData = {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::add_project_to_hackathon`,
        typeArguments: [],
        functionArguments: [
          selectedProjectForHackathon.unique_id,
          hackathonId
        ],
      };

      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });

      console.log("userResponse", userResponse);
      if (userResponse.status === "Approved") {
        await aptos?.waitForTransaction({ transactionHash: userResponse.args.hash });
        toast({
          title: "Success",
          description: "Project successfully applied to hackathon!",
        });
        setIsApplyHackathonDialogOpen(false);
        
        // Refresh the hackathon projects
        if (aptos) {
          const allProjects = await doGetProjects(aptos);
          setHackathonProjects(allProjects);
        }
      }
    } catch (error) {
      console.error("Error applying to hackathon:", error);
      toast({
        title: "Error",
        description: "Failed to apply to hackathon. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyButtonClick = (project: Project) => {
    setSelectedProjectForHackathon(project);
    setIsApplyHackathonDialogOpen(true);
  };

  const handleDonateClick = (project: Project) => {
    setSelectedProjectForDonation(project);
    setIsDonateDialogOpen(true);
  };

  const handleDonateSubmit = async () => {
    if (!selectedProjectForDonation || !donationAmount || !connected) {
      toast({
        title: "Error",
        description: "Please connect wallet and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const transaction: InputGenerateTransactionPayloadData = {
        function: "0x1::coin::transfer",
        typeArguments: ["0x1::aptos_coin::AptosCoin"],
        functionArguments: [
          selectedProjectForDonation.owner,
          amount * 100000000, // Convert to octas (8 decimal places)
        ],
      };

      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });

      if (userResponse.status === "Approved") {
        await aptos?.waitForTransaction({ transactionHash: userResponse.args.hash });
        toast({
          title: "Success",
          description: `Successfully donated ${donationAmount} APT to ${selectedProjectForDonation.name}`,
        });
        setIsDonateDialogOpen(false);
        setDonationAmount("");
        setSelectedProjectForDonation(null);
      }
    } catch (error) {
      console.error("Error donating:", error);
      toast({
        title: "Error",
        description: "Failed to donate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHackathonClick = async (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setIsHackathonInfoDialogOpen(true);
    setIsLoadingWinningProjects(true);
    
    try {
      // Create Aptos instance to fetch winning projects
      const aptosConfig = new AptosConfig({
        network: Network.TESTNET,
        fullnode: APTOS_NODE_URL,
      });
      const aptosClient = new Aptos(aptosConfig);
      
      // Fetch winning project details for each winner
      const winningProjectPromises = hackathon.winners.map(winnerId => 
        doGetProject(aptosClient, winnerId)
      );
      
      const winningProjectResults = await Promise.all(winningProjectPromises);
      const validWinningProjects = winningProjectResults.filter(project => project !== null) as Project[];
      
      setWinningProjects(validWinningProjects);
    } catch (error) {
      console.error("Error fetching winning projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch winning project details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWinningProjects(false);
    }
  };

  useEffect(() => {
    const fetchHackathons = async () => {
      if (aptos && isApplyHackathonDialogOpen) {
        try {
          const fetchedHackathons = await doGetHackathons(aptos);
          console.log("fetchedHackathons", fetchedHackathons);
          setHackathons(fetchedHackathons);
        } catch (error) {
          console.error("Error fetching hackathons:", error);
          toast({
            title: "Error",
            description: "Failed to fetch hackathons",
            variant: "destructive",
          });
        }
      }
    };

    fetchHackathons();
  }, [aptos, isApplyHackathonDialogOpen]);

  // Fetch hackathons when the page is loaded, regardless of wallet connection
  useEffect(() => {
    const fetchHackathonsOnLoad = async () => {
      try {
        // Create Aptos instance regardless of wallet connection
        const aptosConfig = new AptosConfig({
          network: Network.TESTNET,
          fullnode: APTOS_NODE_URL,
        });
        const aptosClient = new Aptos(aptosConfig);
        
        const fetchedHackathons = await doGetHackathons(aptosClient);
        console.log("fetchedHackathons on load", fetchedHackathons);
        /*
        [
            {
                "comments": [
                    "n1c3 project!"
                ],
                "description": "A hackathon focused on building the next generation of Web3 applications",
                "end_date": "1750311420",
                "judges": [
                    "0xe618fe07b01afad7f5cd17374e980ccfa42f24cb1375aa68a5249d15913fd096",
                    "0x3fb7233a48d6f0a8c50e1d1861521790af0c5d7cfaf95ec81dc5bed4541becf1"
                ],
                "name": "Web3 Builders Hackathon",
                "owner": "0x3fb7233a48d6f0a8c50e1d1861521790af0c5d7cfaf95ec81dc5bed4541becf1",
                "projects": [
                    "0"
                ],
                "start_date": "1747633020",
                "unique_id": "0",
                "winners": [
                    "0"
                ]
            }
        ]
        */
        // render the hackathon column by each item.winners of fetchedHackathons, the winners is a list of project unique_id.
        setHackathons(fetchedHackathons);
      } catch (error) {
        console.error("Error fetching hackathons on load:", error);
        toast({
          title: "Error",
          description: "Failed to fetch hackathons",
          variant: "destructive",
        });
      }
    };

    fetchHackathonsOnLoad();
  }, []); // Run on component mount
  
  useEffect(() => {
    const fetchHackathonProjects = async () => {
      if (aptos && isApplyHackathonDialogOpen) {
        try {
          const fetchedProjects = await doGetProjects(aptos);
          setHackathonProjects(fetchedProjects);
        } catch (error) {
          console.error("Error fetching hackathon projects:", error);
          toast({
            title: "Error",
            description: "Failed to fetch hackathon projects",
            variant: "destructive",
          });
        }
      }
    };

    fetchHackathonProjects();
  }, [aptos, isApplyHackathonDialogOpen]);

  // Fetch hackathon projects when the page is loaded, regardless of wallet connection
  useEffect(() => {
    const fetchHackathonProjectsOnLoad = async () => {
      try {
        // Create Aptos instance regardless of wallet connection
        const aptosConfig = new AptosConfig({
          network: Network.TESTNET,
          fullnode: APTOS_NODE_URL,
        });
        const aptosClient = new Aptos(aptosConfig);
        
        const fetchedProjects = await doGetProjects(aptosClient);
        setHackathonProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching hackathon projects on load:", error);
        toast({
          title: "Error",
          description: "Failed to fetch hackathon projects",
          variant: "destructive",
        });
      }
    };

    fetchHackathonProjectsOnLoad();
  }, []); // Run on component mount

  return (
    <main className="flex flex-col w-full max-w-[1333px] mx-auto p-6 pb-12 md:px-8 gap-6">
      <div className="flex justify-between items-center w-full">
        <NavBar />
        <WalletButton />
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-4xl font-semibold tracking-tight">
          <center><h2>Move BuilderBoard</h2></center>
          
        </div>
        <p className={`text-xl text-center ${theme === 'light' ? 'text-black': 'text-white-200'} mb-12`}>
          A fully-on-chain buidlerboard and a fully-on-chain hackathon system.
        </p>
        
        {/* <ShadcnWalletSelector /> */}
        <div className="flex justify-center">
          <Image 
            // TODO: update the satofish to the better version.
            src={theme === 'light' ? "/assets/satofish.svg": "/assets/satofish_white.svg"} 
            alt="satofish" 
            width={100} 
            height={100} 
          />
        </div>
        <p className={`text-xl text-center ${theme === 'light' ? 'text-black': 'text-white-200'} mb-12`}>
          Hey, adventurer!😎 {" "}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
            <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                👉 Add 👈
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add Project</DialogTitle>
              </DialogHeader>
              <AddProjectForm onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          {" "} your project to the builderboard.
        </p>

      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter algorithm module to rank"
              value={rankAlgorithm}
              onChange={(e) => setRankAlgorithm(e.target.value)}
              className="px-3 py-2 bg-[#1E293B] text-[#F8FAFC] rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRankProjects}
              className="px-3 py-2 bg-[#0F172A] text-[#94A3B8] rounded-md text-sm hover:text-[#F8FAFC]"
            >
              Rank
            </button>
            <input
              type="text"
              placeholder="Enter wallet address to filter"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="px-3 py-2 bg-[#1E293B] text-[#F8FAFC] rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSearchAddress("")}
              className="px-3 py-2 bg-[#0F172A] text-[#94A3B8] rounded-md text-sm hover:text-[#F8FAFC]"
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-[#94A3B8]">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>
        <br></br>

        {isLoadingProjects ? (
          <div className="text-center py-8">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchAddress ? 'No projects found for this address' : 'No projects found. Be the first to add one!'}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_0.1fr)_minmax(0,_0.45fr)_minmax(0,_0.22fr)_minmax(0,_0.45fr)_minmax(0,_0.2fr)_minmax(0,_1fr)_minmax(0,_0.2fr)_minmax(0,_0.3fr)] gap-2 md:gap-4 py-2 border-b border-b-[#334155] text-s text-[#94A3B8]">
              <div>Rank</div>
              <div>Project</div>
              <div><center>Category</center></div>
              <div>Important Links</div>
              <div><center>Video</center></div>
              <div>Owner</div>
              <div><center>Donate</center></div>
              <div><center>Hackathon</center></div>
            </div>
            {/* Projects List */}
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.unique_id} 
                project={project} 
                accountInfo={accountInfo}
                hackathons={hackathons}
                onUpdateClick={handleUpdateButtonClick}
                onApplyClick={handleApplyButtonClick}
                onDonateClick={handleDonateClick}
                onHackathonClick={handleHackathonClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Update Project Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Update Project</DialogTitle>
          </DialogHeader>
          {projectToUpdate && (
            <AddProjectForm 
              isUpdate={true}
              project={projectToUpdate}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSubmit={handleUpdateProject}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Apply to Hackathon Dialog */}
      <Dialog open={isApplyHackathonDialogOpen} onOpenChange={setIsApplyHackathonDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Apply to Hackathon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {hackathons.map((hackathon) => (
              <div key={hackathon.unique_id} className="flex flex-col gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{hackathon.name}</h3>
                    <p className="text-sm text-gray-500">{hackathon.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(hackathon.start_date * 1000).toLocaleDateString()} - {new Date(hackathon.end_date * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApplyToHackathon(hackathon.unique_id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">Projects in this hackathon:</h4>
                  <div className="grid gap-2">
                    {hackathonProjects
                      .filter(project => hackathon.projects.includes(project.unique_id))
                      .map(project => (
                        <div key={project.unique_id} className="text-sm text-gray-600 dark:text-gray-300">
                          {project.name}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Donate Dialog */}
      <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Donate to Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedProjectForDonation && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-lg">{selectedProjectForDonation.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedProjectForDonation.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Owner: {`${selectedProjectForDonation.owner.slice(0, 6)}...${selectedProjectForDonation.owner.slice(-4)}`}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="donation-amount" className="text-sm font-medium">
                    Donation Amount (APT)
                  </label>
                  <input
                    id="donation-amount"
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount in APT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleDonateSubmit}
                    disabled={!connected || !donationAmount || parseFloat(donationAmount) <= 0}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {connected ? "Donate" : "Connect Wallet First"}
                  </button>
                  <button
                    onClick={() => {
                      setIsDonateDialogOpen(false);
                      setDonationAmount("");
                      setSelectedProjectForDonation(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hackathon Info Dialog */}
      <Dialog open={isHackathonInfoDialogOpen} onOpenChange={setIsHackathonInfoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>🏆 Hackathon Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedHackathon && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-xl mb-2">{selectedHackathon.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {selectedHackathon.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p className="text-gray-600 dark:text-gray-300">
                        {new Date(selectedHackathon.start_date * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span>
                      <p className="text-gray-600 dark:text-gray-300">
                        {new Date(selectedHackathon.end_date * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">🏆 Winning Projects:</h4>
                    <div className="grid gap-2">
                      {isLoadingWinningProjects ? (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Loading winning projects...</p>
                        </div>
                      ) : winningProjects.length > 0 ? (
                        winningProjects.map(project => (
                          <div key={project.unique_id} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-green-800 dark:text-green-200">{project.name}</h5>
                                <p className="text-sm text-green-600 dark:text-green-300">{project.description}</p>
                              </div>
                              <span className="text-2xl">🏆</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-300">No winning projects found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">📋 Participating Projects:</h4>
                    <div className="grid gap-2">
                      {hackathonProjects
                        .filter(project => selectedHackathon.projects.includes(project.unique_id))
                        .map(project => (
                          <div key={project.unique_id} className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h5 className="font-medium">{project.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setIsHackathonInfoDialogOpen(false);
                      setSelectedHackathon(null);
                      setWinningProjects([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
