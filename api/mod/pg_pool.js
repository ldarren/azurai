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
			const res = await pool.query('SELECT * FROM accounts WHERE id = $1 and type = $2 and s = $3;', [ghuser.login, type, 1])
			const account = res.rows[0]
			Object.assign(output, account)
			return this.next()
		},
		async set(){
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
		async get(type, account, output){
			const res = await pool.query('SELECT * FROM users WHERE id = $1 and s = $2;', [account.user_id, 1])
			const user = res.rows[0]
			Object.assign(output, user)
			return this.next()
		},
		// create new user
		async set(type, ghuser, cred){
			await pool.query('INSERT INTO accounts (id, type, user_id, credentials) VALUES ($1, $2, $3, $4);', [ghuser.login, type, 0, JSON.stringify(cred)])
			return this.next()
		}
	}
}
