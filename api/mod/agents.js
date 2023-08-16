const pObj = require('pico-common').export('pico/obj')

module.exports = {
	setup(cfg){

	},
	validate(agent, spec, output){
		if (agent.id)
		pObj.validate(agent, spec, output)
		return this.next()
	},
	deleteBody(agent, output){
		Object.assign(output, agent, {
			s: 0
		})
		return this.next()
	}
}