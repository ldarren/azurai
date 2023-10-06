const psUtil = pico.import('picos-util')
const pObj = require('pico/obj')
const base = require('service/base.json')
const routeUtil = require('service/route_util.json')
const routeAccounts = require('service/route_accounts.json')
const routeAgents = require('service/route_agents.json')
const routeEmbedding = require('service/route_embedding.json')
const routeQuery = require('service/route_query.json')
const routeLLM = require('service/route_llm.json')
const rsc = require('service/rsc')
const env = require('env.json')
const out = {}

this.load = () => {
	if (env){
		psUtil.env(pObj.flatten(env))
	}
	pObj.replace(base, process.env)
	pObj.extends(out, [
		base,
		rsc,
		routeUtil,
		routeAccounts,
		routeAgents,
		routeEmbedding,
		routeQuery,
	])
}
return out
