const { Pool } = require('pg')

let pool

module.exports = {
	setup(cfg){
		pool = new Pool(cfg)
	},
	user: {
		// return error if ghuser already exist
		async validate(ghuser){
			return this.next()
		},
		// create new user
		async save(ghuser, cred, output){
			return this.next()
		}
	}
}
