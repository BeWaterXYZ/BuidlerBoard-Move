import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getBuilderboardDeveloper,
  getBuilderboardProject,
  getRankingTags,
  RankingTagType,
  importGithubProject,
} from "./leaderboard";

export function useRankingTags(type?: RankingTagType) {
  const { data: allTags = [], ...rest } = useQuery({
    queryKey: ["RankingTags"],
    queryFn: getRankingTags,
  });

  const filteredTags = type
    ? allTags.filter((tag) => tag.type === type)
    : allTags;

  return {
    ...rest,
    data: filteredTags,
  };
}

export function useBuilderboardDeveloper(
  limit: number,
  ecosystem: string,
  sector: string,
) {
  return useQuery({
    queryKey: ["BuilderboardDeveloper", limit, ecosystem, sector],
    queryFn: async () => {
      return getBuilderboardDeveloper(limit, ecosystem, sector);
    },
  });
}

export function useBuilderboardProject(
  limit: number,
  ecosystem: string,
  sector: string,
) {
  return useQuery({
    queryKey: ["BuilderboardProject", limit, ecosystem, sector],
    queryFn: async () => {
      return getBuilderboardProject(limit, ecosystem, sector);
    },
  });
}

export function useImportGithubProject() {
  return useMutation({
    mutationFn: async (repoUrl: string) => {
      return importGithubProject(repoUrl);
    },
  });
} 