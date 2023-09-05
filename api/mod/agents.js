const pObj = require('pico-common').export('pico/obj')

const DEFAULT_PARAMS = {model: 'gpt-3.5-turbo'}

module.exports = {
	setup(cfg){
		if (!cfg.params) return
		Object.assign(DEFAULT_PARAMS, cfg.params)
	},
	validate(spec, type){
		const mandatory = type === 'create'
		return function(agent, output) {
			if (mandatory && (!agent.id || !agent.name)) return this.next({status: 400, message: 'invalid id or name'})
			if (mandatory || agent.params) {
				const params = {}
				const res = pObj.validate(spec, agent.params ?? DEFAULT_PARAMS, params)
				if (res) return this.next({status: 400, message: res})
				Object.assign(output, agent, {
					params
				})
			}
			return this.next()
		}
	},
	exist(agent){
		if (!agent.id) return this.next({status: 404})
		return this.next()
	},
	deleteBody(agent, output){
		Object.assign(output, agent, {
			s: 0
		})
		return this.next()
	}
}