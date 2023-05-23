const pico = require('pico-common')

function SERP(cfg){
	this.description = cfg.desc
	this.host = cfg.host
	this.params = cfg.params
}

SERP.prototype = {
	await execute(q){
		return new Promise((resolve, reject) => {
			pico.ajax('GET', this.host, Object.assign({q}, this.params), null, (err, state, xhr) => {
				if (4 !== state) return
				if (err) return reject(err)
				try { resolve(JSON.parse(xhr)) }
				catch(ex) { resolve(ex) }
			})
		})
	}
}

module.exports = {
	setup(cfg){
		return new SERP(cfg)
	}
}
