-- 开发者表
CREATE TABLE developers (
  id BIGSERIAL PRIMARY KEY,
  html_url TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  total_stars INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  bio TEXT,
  popular_repo JSONB,
  ecosystem TEXT,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 仓库表
CREATE TABLE repositories (
  id BIGSERIAL PRIMARY KEY,
  repoName TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  languages TEXT[],
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  topics TEXT[],
  ecosystem TEXT,
  sector TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 仓库贡献者关联表
CREATE TABLE repository_contributors (
  repository_id BIGINT REFERENCES repositories(id),
  login TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  PRIMARY KEY (repository_id, login)
); 