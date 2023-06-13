const ACCEPT = 'accept'
const ALLOW_ORIGIN = process.env.mod_web_ac_allow_origin
const MAX_AGE = process.env.mod_web_ac_max_age

module.exports = {
	setup(cfg, rsc, paths){
		return module.exports
	},

	handleOption(req, res){
		if (!ALLOW_ORIGIN) return this.next()
		res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN)
		res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS')
		res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
		res.setHeader('Access-Control-Max-Age', MAX_AGE)
		if ('OPTIONS' === req.method){
			res.statusCode = 204
			return res.end()
		}
		return this.next()
	},

	router(key){
		return async function(method, params){
			await this.next(null, `${method}/${params[key]}`)
			return this.next()
		}
	},

	branchByContentType(map, def){
		return function(req){
			const ct = req.headers[ACCEPT]
			const route = map[ct] || map[def]
			if (!route) return this.next(`no route for ${ACCEPT}: ${ct}`)
			return this.next(null, route)
		}
	},

	async branchSeq(route, list, inputKey = 'input', outputKey = 'output', otherKeys = []){
		for (const input of list){
			await this.next(null, route, Object.assign({[inputKey]: input, [outputKey]: {}},pico.extract( this.data, otherKeys)))
		}
		return this.next()
	},

	async branchPar(route, list, inputKey = 'input', outputKey = 'output', otherKeys = []){
		for (const input of list){
			this.next(null, route, Object.assign({[inputKey]: input, [outputKey]: {}},pico.extract( this.data, otherKeys)))
		}
		return this.next()
	},

	async wait(sec){
		await new Promise((resolve, reject) => {
			setTimeout(resolve, sec)
		})
		return this.next()
	},

	push(array, item){
		array.push(item)
		return this.next()
	},

	log(obj){
		console.log(obj)
		return this.next()
	},
}
