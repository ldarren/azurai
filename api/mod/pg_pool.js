// Use Client if need listen to trigger
const { Pool } = require('pg')

let pool

module.exports = {
	setup(cfg){
		const config = Object.assign({}, cfg)
		config.port = parseInt(cfg.port)
		pool = new Pool(cfg)
	},
	user: {
		// return error if ghuser already exist
		async validate(ghuser){
			const res = await pool.query('SELECT * FROM accounts WHERE id = $1 and type = $2 and s = $3;', [ghuser.login, 'github', 1])
			const user = res.rows[0]
			if (user) return this.next({status: 400})
			return this.next()
		},
		// create new user
		async save(ghuser, cred, output){
			await pool.query('INSERT INTO accounts (id, type, user_id, credentials) VALUES ($1, $2, $3, $4);', [ghuser.login, 'github', 0, JSON.stringify(cred)])
			return this.next()
		}
	}
}
