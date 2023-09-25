// Use Client if need listen to trigger
const { Pool } = require('pg')

let pool

module.exports = {
	setup(cfg){
		const config = Object.assign({}, cfg)
		config.port = parseInt(cfg.port)
		pool = new Pool(cfg)
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
		async save(memory, userId, output){
			const res = await pool.query(`
			INSERT INTO memories (agent_id, project, filepath, source, type, s, cby)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (project, filepath)
			DO UPDATE SET
				agent_id = COALESCE(EXCLUDED.agent_id, memories.agent_id),
				source =  COALESCE(EXCLUDED.source, memories.source),
				type = COALESCE(EXCLUDED.type, memories.type),
				s = COALESCE(EXCLUDED.s, memories.s),
				uby = EXCLUDED.cby,
				uat = NOW()
			RETURNING *;`, [memory.agent_id, memory.projectName, memory.path, memory.text, memory.contentType, memory.s, userId])
			Object.assign(output, res.rows[0])
			return this.next()
		},
	},
	memory_chunks: {
		async save(memory_id, userId, chunk, output){
			try{
				const res = await pool.query(`
					INSERT INTO memory_chunks (memory_id, chunk, s, cby)
					VALUES ($1, $2, 1, $3) RETURNING *;`,
					[memory_id, chunk, userId]
				)
				Object.assign(output, res.rows[0])
			}catch(ex){
				console.error(ex)
				return this.next({status: 500, message: ex.message})
			}
			return this.next()
		},
		async delete(memory_id, userId, output){
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
