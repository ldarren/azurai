// Use Client if need listen to trigger
const { Pool } = require('pg')

let pgvector
let pool

async function register(client) {
	await pgvector.registerType(client)
}

module.exports = {
	async setup(cfg){
		pgvector = await import('pgvector/pg')
		pool = new Pool(cfg)
		pool.on('connect', register)
	},
	accounts: {
		async get(type, ghuser, output){
			const res = await pool.query('SELECT * FROM accounts WHERE id = $1 and type = $2 and s = 1;', [ghuser.login, type])
			const account = res.rows[0]
			Object.assign(output, account)
			return this.next()
		},
		async getByUserId(type, user, output){
			const res = await pool.query('SELECT * FROM accounts WHERE user_id = $1 and type = $2 and s = 1;', [user.id, type])
			const account = res.rows[0]
			Object.assign(output, account)
			return this.next()
		},
		async list(user, output){
			const res = await pool.query('SELECT * FROM accounts WHERE user_id = $1 and s = 1 and (eat is NULL or eat < now());', [user.id])
			const accounts = res.rows
			output.push(...accounts)
			return this.next()
		},
		async set(type, account, user = {}, ghuser = {}, cred = null){
			const query = {
				// give he query a unique name
				name: 'accounts-upsert',
				text: 'INSERT INTO accounts (id, type, user_id, cred, cby) VALUES($1, $2, $3, $4, $3) ON CONFLICT (id, type) DO UPDATE SET cred = EXCLUDED.cred, uby = EXCLUDED.cby, uat = NOW() RETURNING *;',
				values: [
					ghuser.login || account.id,
					type,
					user.id || account.user_id,
					JSON.stringify(cred),
				]
			}
			const res = await pool.query(query)
			Object.assign(account, res.rows[0])
			return this.next()
		},
	},
	users: {
		async get(account, output){
			const res = await pool.query('SELECT * FROM users WHERE id = $1 and s = 1;', [account.user_id])
			const user = res.rows[0]
			Object.assign(output, user)
			return this.next()
		},
		// create new user
		async set(output){
			const res = await pool.query('INSERT INTO users (s) VALUES (1) RETURNING id;')
			const user = res.rows[0]
			Object.assign(output, user)
			return this.next()
		}
	},
	agents: {
		async list(user, output){
			const res = await pool.query('SELECT * FROM agents WHERE cby = $1 and s = 1;', [user.id])
			const agents = res.rows
			output.push(...agents)
			return this.next()
		},
		async get(agentId, userId, output){
			const res = await pool.query('SELECT * FROM agents WHERE id = $1 and cby = $2 and s = 1;', [agentId, userId])
			const agent = res.rows[0] ?? {}
			Object.assign(output, agent)
			return this.next()
		},
		async insert(agent, user, output){
			try{
				const res = await pool.query(`
					INSERT INTO agents (id, name, summary, params, persona, s, cby)
					VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
					[agent.id, agent.name, agent.summary, agent.params, agent.persona, agent.s ?? 1, user.id]
				)
				output.push(...res.rows)
			}catch(ex){
				console.error(ex)
				return this.next({status: 500, message: ex.message})
			}
			return this.next()
		},
		async update(agent, user, output){
			try{
				const res = await pool.query(`
					UPDATE agents SET
					name = COALESCE($1, agents.name),
					summary = COALESCE($2, agents.summary),
					params = COALESCE($3, agents.params),
					persona = COALESCE($4, agents.persona),
					s = COALESCE($5, agents.s),
					uby = $6,
					uat = NOW() WHERE id = $7 and cby = $6 RETURNING *;`,
					[agent.name, agent.summary, agent.params, agent.persona, agent.s, user.id, agent.id]
				)
				output.push(...res.rows)
			}catch(ex){
				console.error(ex)
				return this.next({status: 500, message: ex.message})
			}
			return this.next()
		},
		async set(agent, user, output){
			const res = await pool.query(`
			INSERT INTO agents (id, name, summary, params, persona, s, cby)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (id)
			DO UPDATE SET
				name = EXCLUDED.name,
				summary = EXCLUDED.summary,
				persona = COALESCE(EXCLUDED.persona, agents.persona),
				s = COALESCE(EXCLUDED.s, agents.s),
				uby = EXCLUDED.cby,
				uat = NOW()
			RETURNING *;`, [agent.id, agent.name, agent.summary, agent.params, agent.persona, agent.s, user.id])
			output.push(...res.rows)
			return this.next()
		},
		async delete(agent, user, output){
			const res = await pool.query(`
			UPDATE agents SET
				s = 0,
				uby = $1,
				uat = NOW()
			WHERE id = $2
			RETURNING *;`, [user.id, agent.id])
			Object.assign(output, res.rows[0])
			return this.next()
		}
	},
	memories: {
		async readByPath(path, userId, outputs){
			const res = await pool.query('SELECT * FROM memories WHERE path = $1 and cby = $2 and s = 1;', [path, userId])
			outputs.push(...res.rows)
			return this.next()
		},
		async readByIds(ids, userId, outputs){
			const res = await pool.query('SELECT * FROM memories WHERE id = ANY($1::int[]) and cby = $2 and s = 1;', [ids, userId])
			outputs.push(...res.rows)
			return this.next()
		},
		async save(memory, path, content, userId, output){
			const res = await pool.query(`
			INSERT INTO memories (agent_id, project, path, name, source, type, s, cby)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (project, path, name)
			DO UPDATE SET
				agent_id = COALESCE(EXCLUDED.agent_id, memories.agent_id),
				source =  COALESCE(EXCLUDED.source, memories.source),
				type = COALESCE(EXCLUDED.type, memories.type),
				s = COALESCE(EXCLUDED.s, memories.s),
				uby = EXCLUDED.cby,
				uat = NOW()
			RETURNING *;`,
			[memory.agent_id, memory.projectName, path, content.path, memory.text, content.type, memory.s, userId])
			Object.assign(output, res.rows[0])
			return this.next()
		},
	},
	memory_chunks: {
		async updateEmbeddingById(id, embedding, output){
			const res = await pool.query(`
				UPDATE memory_chunks SET
					embedding = $2,
					s = 2,
					uby = 0,
					uat = NOW()
				WHERE id = $1
				RETURNING *;`,
			[id, pgvector.toSql(embedding)])
			if (output) Object.assign(output, res.rows[0])
			return this.next()
		},
		async search(userId, embedding, name, outputs){
			const res = await pool.query('SELECT *, (1 - (embedding <=> $3)) as similarity FROM memory_chunks WHERE cby = $1 and name = $2 ORDER BY embedding <=> $3 LIMIT 5',
			[userId, name, pgvector.toSql(embedding)])
			if (Array.isArray(outputs)) outputs.push(...res.rows)
			return this.next()
		},
		async readNewByUserId(output){
			const res = await pool.query(`
				UPDATE memory_chunks
				SET s = 2, uby = 0, uat = NOW()
				WHERE id = (
					SELECT id
					FROM memory_chunks
					WHERE s = 1 LIMIT 1
					FOR UPDATE SKIP LOCKED) RETURNING *;`)
			Object.assign(output, res.rows[0])
			return this.next()
		},
		async readByMemoryIdsWithName(memoryIds, userId, name, outputs){
			const res = await pool.query('SELECT * FROM memory_chunks WHERE memory_id = ANY ($1) AND cby = $2 AND name = $3 AND s = 1;', [memoryIds, userId, name])
			outputs.push(...res.rows)
			return this.next()
		},
		async readByMemoryIds(memoryIds, userId, outputs){
			const res = await pool.query('SELECT * FROM memory_chunks WHERE memory_id = ANY ($1) AND cby = $2 AND s = 1;', [memoryIds, userId])
			outputs.push(...res.rows)
			return this.next()
		},
		async save(name, memory_id, userId, chunk, output){
			try{
				const res = await pool.query(`
					INSERT INTO memory_chunks (memory_id, name, chunk, s, cby)
					VALUES ($1, $2, $3, 1, $4)
					ON CONFLICT (memory_id, name)
					DO UPDATE SET
						chunk = COALESCE(EXCLUDED.chunk, memory_chunks.chunk),
						s = COALESCE(EXCLUDED.s, memory_chunks.s),
						uby = EXCLUDED.cby,
						uat = NOW()
					RETURNING *;`,
					[memory_id, name, chunk, userId]
				)
				Object.assign(output, res.rows[0])
			}catch(ex){
				console.error(ex)
				return this.next({status: 500, message: ex.message})
			}
			return this.next()
		},
		async deleteByMemoryId(memory_id, userId, output){
			try{
				const res = await pool.query(`
					UPDATE memory_chunks SET s = 0, uby = $1 where memory_id = $2`,
					[userId, memory_id]
				)
				Object.assign(output, res.rows[0])
			}catch(ex){
				console.error(ex)
				return this.next({status: 500, message: ex.message})
			}
			return this.next()
		}
	}
}
