import { agentAuthed, BWagentAuthed } from "./api";

export enum RankingTagType {
  ECOSYSTEM = "ECOSYSTEM",
  SECTOR = "SECTOR",
}

export interface RankingTag {
  id: number;
  name: string;
  type: RankingTagType;
  description?: string;
}

export interface BuilderboardLanguage {
  name: string;
  percentage: number;
}

export interface BuilderboardDeveloper {
  html_url: string;
  avatar_url: string;
  login: string;
  total_stars: number;
  followers: number;
  bio: string | null;
  popular_repo: {
    html_url: string;
    name: string;
    description: string | null;
    languages: BuilderboardLanguage[];
  };
}

export interface BuilderboardContributor {
  login: string;
  avatar_url: string;
}

export interface BuilderboardProject {
  repoName: string;
  name: string;
  description: string;
  languages: string[];
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  contributors: BuilderboardContributor[];
}

export async function getRankingTags() {
  const { data } = await BWagentAuthed.get<{ data: RankingTag[] }>(`/billboard/ranking-tags`);
  return data.data;
}

export async function getBuilderboardDeveloper(
  limit: number,
  ecosystem?: string,
  sector?: string,
) {
  const { data } = await agentAuthed.get<{ data: BuilderboardDeveloper[] }>(
    `/billboard/operation/developer-list?limit=${limit}&ecosystem=${ecosystem}&sector=${sector}`,
  );
  return data.data;
}

export async function getBuilderboardProject(
  limit: number,
  ecosystem?: string,
  sector?: string,
) {
  const { data } = await agentAuthed.get<{ data: BuilderboardProject[] }>(
    `/billboard/operation/project-list?limit=${limit}&ecosystem=${ecosystem}&sector=${sector}`,
  );
  return data.data;
}

export async function importGithubProject(repoUrl: string) {
  const { data } = await agentAuthed.post<{ data: BuilderboardProject }>(
    `/billboard/import-github-project`,
    { repoUrl },
  );
  return data.data;
} 