export interface Developer {
  id: number;
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
    languages: Array<{
      name: string;
      percentage: number;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: number;
  github_id: string;
  login: string;
  name: string | null;
  avatar_url: string;
  followers: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: number;
  repoName: string;
  name: string;
  description: string | null;
  languages: string[];
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  contributors: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
    total_stars: number;
    followers: number;
    bio: string | null;
    popular_repo: {
      html_url: string;
      name: string;
      description: string | null;
      languages: Array<{
        name: string;
        percentage: number;
      }>;
    };
  }>;
} 