-- 开发者表
CREATE TABLE developers (
  id BIGINT PRIMARY KEY,
  login VARCHAR NOT NULL,
  html_url VARCHAR NOT NULL,
  avatar_url VARCHAR NOT NULL,
  bio TEXT,
  followers INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  blockchain_tx VARCHAR,
  popular_repo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  movement_address VARCHAR,
  badges JSONB[] DEFAULT ARRAY[]::JSONB[],
  endorsements JSONB[] DEFAULT ARRAY[]::JSONB[],
  reputation INTEGER DEFAULT 0
);

-- 仓库表
CREATE TABLE repositories (
  id BIGSERIAL PRIMARY KEY,
  reponame TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  languages TEXT[],
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  topics TEXT[],
  ecosystem TEXT,
  sector TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  score INTEGER,
  blockchain_tx TEXT,
  badges JSONB[] DEFAULT '{}',
  endorsements JSONB[] DEFAULT '{}'
);

-- 仓库贡献者关联表
CREATE TABLE repository_contributors (
  repository_id BIGINT REFERENCES repositories(id),
  login TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  PRIMARY KEY (repository_id, login)
);