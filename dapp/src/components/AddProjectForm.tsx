import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAptosWallet } from "@razorlabs/wallet-kit";
import { Aptos, AptosConfig, Network, InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";

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
}

const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS;
const DAPP_NAME = process.env.NEXT_PUBLIC_DAPP_NAME;

interface AddProjectFormProps {
  onClose: () => void;
  isUpdate?: boolean;
  project?: Project;
  onSubmit?: (
    unique_id: number,
    name: string,
    category: string,
    githubUrl: string,
    demoUrl: string,
    deckUrl: string,
    introVideoUrl: string
  ) => Promise<void>;
}

export function AddProjectForm({ onClose, isUpdate, project, onSubmit }: AddProjectFormProps) {
  const { toast } = useToast();
  const { signAndSubmitTransaction } = useAptosWallet();
  const [projectName, setProjectName] = useState(project?.name || "");
  const [category, setCategory] = useState(project?.category || "");
  const [githubUrl, setGithubUrl] = useState(project?.github_url || "");
  const [demoUrl, setDemoUrl] = useState(project?.demo_url || "");
  const [deckUrl, setDeckUrl] = useState(project?.deck_url || "");
  const [introVideoUrl, setIntroVideoUrl] = useState(project?.intro_video_url || "");

  const handleSubmit = async () => {
    if (isUpdate && onSubmit && project) {
      await onSubmit(
        project.unique_id,
        projectName,
        category,
        githubUrl,
        demoUrl,
        deckUrl,
        introVideoUrl
      );
      return;
    }

    try {
      // Create Aptos client
      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(aptosConfig);

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

      const userResponse = await signAndSubmitTransaction({
        payload: transaction,
      });

      if (userResponse.status === "Approved") {
        toast({
          title: "Success",
          description: "Project added successfully!",
        });
        onClose();
      }
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
          {isUpdate ? "Update" : "Submit"}
        </Button>
      </center>
    </div>
  );
} 