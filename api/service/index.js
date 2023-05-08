const psUtil = pico.import('picos-util')
const pObj = require('pico/obj')
const base = require('service/base.json')
const routes = require('service/routes.json')
const env = require('env.json')
const out = {}

this.load = () => {
	if (env){
		psUtil.env(pObj.flatten(env))
	}
	pObj.replace(base, process.env)
	pObj.extends(out, [base, routes])
}
return out