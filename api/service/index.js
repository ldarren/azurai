const psUtil = pico.import('picos-util')
const pObj = require('pico/obj')
const base = require('service/base.json')
const routeAccounts = require('service/route_accounts.json')
const routeAgents = require('service/route_agents.json')
const routeLLM = require('service/route_llm.json')
const rsc = require('service/rsc')
const env = require('env.json')
const out = {}

this.load = () => {
	if (env){
		psUtil.env(pObj.flatten(env))
	}
	pObj.replace(base, process.env)
	pObj.extends(out, [base, rsc, routeAccounts, routeAgents, routeLLM])
}
return out
