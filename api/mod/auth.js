module.exports = {
	setup(cfg){
	},
	async create(user, payload, output){
		return this.next()
	},
	async validate(req, user, payload){
		return this.next()
	},
}
