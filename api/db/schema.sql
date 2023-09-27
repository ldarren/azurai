CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
  s SMALLINT DEFAULT 1,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(320) PRIMARY KEY,
  user_id BIGINT,
  type VARCHAR(8) NOT NULL,
  cred JSON,
  s SMALLINT DEFAULT 1,
  cby BIGINT,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby BIGINT,
  uat TIMESTAMPTZ DEFAULT NOW(),
  eat TIMESTAMPTZ,
	CONSTRAINT uniq_acc_id_type UNIQUE (id, type)
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_accounts_user_id_type ON accounts (user_id, type);

CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  summary VARCHAR,
  params JSON,
  persona VARCHAR,
  s SMALLINT DEFAULT 1,
  cby BIGINT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby BIGINT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_agents_name ON agents (name);
CREATE INDEX IF NOT EXISTS index_agents_cby ON agents (cby, s);

CREATE TABLE IF NOT EXISTS memories (
  id BIGSERIAL PRIMARY KEY,
  agent_id VARCHAR(64) NOT NULL,
-- projectName
  project VARCHAR(256) NOT NULL,
-- filePath
  path VARCHAR(1024) NOT NULL,
-- filePath
  filename VARCHAR(1024) NOT NULL,
-- fileContents
  source VARCHAR NOT NULL,
-- contentType
  type VARCHAR(16) NOT NULL,
  s SMALLINT DEFAULT 1,
  cby BIGINT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby BIGINT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_memories_project_filepaths ON memories (project, path, filename);
CREATE INDEX IF NOT EXISTS index_memories_agent_id ON memories (agent_id);

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS memory_chunks (
  id BIGSERIAL PRIMARY KEY,
  memory_id BIGINT NOT NULL,
  chunk VARCHAR NOT NULL,
  embedding vector(1536),
  s SMALLINT DEFAULT 1,
  cby BIGINT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby BIGINT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS index_memory_chunk_memory_id ON memory_chunks (memory_id);
