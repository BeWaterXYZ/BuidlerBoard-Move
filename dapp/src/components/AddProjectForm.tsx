import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { Aptos, AptosConfig, Network, InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";

const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS;
const DAPP_NAME = process.env.NEXT_PUBLIC_DAPP_NAME;

export function AddProjectForm() {
  const { toast } = useToast();
  const { signAndSubmitTransaction } = useAptosWallet();
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [deckUrl, setDeckUrl] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");

  const handleSubmit = async () => {
    try {
      // Create Aptos client
      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(aptosConfig);
      
      // !NOTE: this is the comment, not delete it.
      // public entry fun add_project(
      //   account: &signer, 
      //   name: string::String, 
      //   category: string::String,
      //   github_url: string::String, 
      //   demo_url: string::String, 
      //   deck_url: string::String, 
      //   intro_video_url: string::String) acquires ProjectAggregator {

      // Prepare transaction payload
      const transaction: InputGenerateTransactionPayloadData = {
        function: `${DAPP_ADDRESS}::${DAPP_NAME}::add_project`,
        typeArguments: [],
        functionArguments: [
          projectName,
          category,
          githubUrl,
          demoUrl,
          deckUrl,
          introVideoUrl
        ],
      };

      // Sign and submit transaction
      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });

      if ('hash' in userResponse && typeof userResponse.hash === 'string') {
        // Wait for transaction to be confirmed
        await aptos.waitForTransaction({ transactionHash: userResponse.hash });
        // show success only if the tx is successful.
        toast({
          title: "Success",
          description: "Project added successfully!",
        });
      }
      // Reset form state after submission
      setProjectName("");
      setCategory("");
      setGithubUrl("");
      setProjectDescription("");
      setDemoUrl("");
      setDeckUrl("");
      setIntroVideoUrl("");
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <div className="flex flex-col gap-2">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
          placeholder="Enter project category"
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="githubUrl">GitHub URL</Label>
        <Input
          id="githubUrl"
          value={githubUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
          placeholder="Enter GitHub repository URL"
          className="w-full"
        />
      </div>
      {/* <div className="flex flex-col gap-2">
        <Label htmlFor="projectDescription">Description</Label>
        <Textarea
          id="projectDescription"
          value={projectDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectDescription(e.target.value)}
          placeholder="Enter project description"
          className="w-full"
        />
      </div> */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="demoUrl">Demo URL</Label>
        <Input
          id="demoUrl"
          value={demoUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoUrl(e.target.value)}
          placeholder="Enter demo URL"
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="deckUrl">Deck URL</Label>
        <Input
          id="deckUrl"
          value={deckUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckUrl(e.target.value)}
          placeholder="Enter presentation deck URL"
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="introVideoUrl">Intro Video URL</Label>
        <Input
          id="introVideoUrl"
          value={introVideoUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIntroVideoUrl(e.target.value)}
          placeholder="Enter introduction video URL"
          className="w-full"
        />
      </div>
      <center>
        <Button onClick={handleSubmit}>
          Submit
        </Button>
      </center>
    </div>
  );
} 