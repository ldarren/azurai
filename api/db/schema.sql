CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
  s SMALLINT DEFAULT 1,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(320) PRIMARY KEY,
  user_id INT,
  type VARCHAR(8) NOT NULL,
  cred JSON,
  s SMALLINT DEFAULT 1,
  cby INT,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby INT,
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
  cby INT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby INT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_agents_name ON agents (name);
CREATE INDEX IF NOT EXISTS index_agents_cby ON agents (cby, s);

CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(64) NOT NULL,
-- projectName
  project VARCHAR(256) NOT NULL,
-- filePath
  path VARCHAR(1024) NOT NULL,
-- filePath
  name VARCHAR(1024) NOT NULL,
-- fileContents
  source VARCHAR,
-- contentType
  type VARCHAR(16) NOT NULL,
  s SMALLINT DEFAULT 1,
  cby INT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby INT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_memories_project_filepaths ON memories (project, path, name);
CREATE INDEX IF NOT EXISTS index_memories_agent_id ON memories (agent_id);

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS memory_chunks (
  id SERIAL PRIMARY KEY,
  memory_id INT NOT NULL,
  name VARCHAR NOT NULL,
  chunk VARCHAR NOT NULL,
  embedding vector(1536),
  s SMALLINT DEFAULT 1,
  cby INT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby INT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_memory_chunk_memory_id_name ON memory_chunks (memory_id, name);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  agent_id INT NOT NULL,
  title VARCHAR,
  model VARCHAR NOT NULL,
  params JSON,
  s SMALLINT DEFAULT 1,
  cby INT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby INT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chat_sessions_cby_s ON chat_sessions (cby, s);

CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL,
  parent_id INT,
  function_id INT,
  role VARCHAR NOT NULL,
  content VARCHAR NOT NULL,
  tokens INT,
  meta JSON,
  s SMALLINT DEFAULT 1,
  cby INT NOT NULL,
  cat TIMESTAMPTZ DEFAULT NOW(),
  uby INT,
  uat TIMESTAMPTZ DEFAULT NOW()
);
