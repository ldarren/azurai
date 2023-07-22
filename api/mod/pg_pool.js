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
		// return sigin if ghuser already exist
		async validate(account){
			if (account.user_id) {
				const user = res.rows[0]
				this.next(null, `signin`, Object.assign({}, this.data, {user, account}))
			} else {
				this.next(null, `confirm`)
			}
			return this.next()
		},
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
	}
}
