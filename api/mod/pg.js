const { Pool, Client } = require('pg')

const client
const warn = (msg) => console.warn('notice', msg)
const error = (err) => console.error('error', err.stack)

module.exports = {
	setup(cfg){
		client = new Client(cfg)
		// notification https://node-postgres.com/apis/client#notification
		//client.query('LISTEN foo')
		client.on('notice', warn)
		client.on('error', error)
		const pool = new Pool(cfg)
		return pool
	},
}
