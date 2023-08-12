const { createClient } = require('redis')

const MIN10 = 60 * 10
const KEY_CONFIRM = 'confirm:'
let client

module.exports = {
	async setup(cfg){
		client = createClient(cfg)
		await client.connect()
	},
	async save(key, value){
		await client.setEx(KEY_CONFIRM + key, MIN10, JSON.stringify(value))
		return this.next()
	},
	async readOnce(key, output){
		const value = await client.getDel(KEY_CONFIRM + key)
		Object.assign(output, JSON.parse(value))
		return this.next()
	},
}
