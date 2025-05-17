import { useState } from "react";
import { Input } from "@/components/form/control";
import { useLoadingStoreAction } from "@/components/loading/store";
import { useToastStore } from "@/components/toast/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useImportGithubProject } from "@/services/leaderboard.query";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  repoUrl: z.string()
    .url("Please enter a valid URL")
    .regex(/^https:\/\/github\.com\/[^/]+\/[^/]+$/, "Invalid GitHub repository URL format")
});

type Inputs = z.infer<typeof schema>;

interface BuilderboardImportDialogProps {
  data?: Record<string, any>;
  close: () => void;
}

export default function BuilderboardImportDialog({
  data,
  close,
}: BuilderboardImportDialogProps) {
  const { showLoading, dismissLoading } = useLoadingStoreAction();
  const addToast = useToastStore((s) => s.add);
  const importMutation = useImportGithubProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData: Inputs) => {
    setIsSubmitting(true);
    showLoading();
    try {
      await importMutation.mutateAsync(formData.repoUrl);
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['BuilderboardDeveloper'] 
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['BuilderboardProject'] 
        })
      ]);
      addToast({
        type: "success",
        title: "Success",
        description: "Project has been queued for import",
      });
      close();
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error",
        description: error?.response?.data?.message || "Failed to import project",
      });
    } finally {
      dismissLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-[80vw] max-w-md">
      <h2 className="heading-6 mb-6 text-center">Upload Github Link</h2>
{/*       
      <div className="flex justify-center mb-6">
        <img src="/icons/github.svg" alt="GitHub" className="w-16 h-16" />
      </div>

      <p className="text-center text-white/70 mb-6">
        Information about verified projects and developers will be displayed on the Builderboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          inputClassName="h-12"
          placeholder="example: https://github.com/owner/repo"
          error={errors["repoUrl"]}
          disabled={isSubmitting}
          {...register("repoUrl")}
        />

        <div className="flex justify-center mt-6">
          <button 
            type="submit" 
            className="btn btn-primary w-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>

      {isSubmitting && (
        <p className="text-center text-white/70 mt-4">
          Please wait while we process your request. This operation involves blockchain transactions and may take a few minutes.
        </p>
      )} */}
    </div>
  );
} 