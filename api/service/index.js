const psUtil = pico.import('picos-util')
const pObj = require('pico/obj')
const base = require('service/base.json')
const routeLLM = require('service/route_llm.json')
const routeAccounts = require('service/route_accounts.json')
const rsc = require('service/rsc')
const env = require('env.json')
const out = {}

this.load = () => {
	if (env){
		psUtil.env(pObj.flatten(env))
	}
	console.log('process.env', process.env)
	pObj.replace(base, process.env)
	console.log('base', base)
	pObj.extends(out, [base, rsc, routeLLM, routeAccounts])
}
return out
