const pObj = require('pico-common').export('pico/obj')

const ACCEPT = 'accept'
const ALLOW_ORIGIN = process.env.mod_web_ac_allow_origin
const MAX_AGE = process.env.mod_web_ac_max_age

function extract(obj, keys){
	return keys.reduce((acc, key) => Object.assign(acc, {[key]: obj[key]}), {})
}

module.exports = {
	setup(cfg, rsc, paths){
		return module.exports
	},

	router(key){
		return async function(method, params){
			await this.next(null, `${method}/${params[key]}`)
			return this.next()
		}
	},

	async branchSeq(route, list, inputKey = 'input', outputKey = 'output', otherKeys = []){
		const data = extract(this.data, otherKeys)
		for (const input of list){
			await this.next(null, route, Object.assign({[inputKey]: input, [outputKey]: {}}, data))
		}
		return this.next()
	},

	async branchPar(route, list, inputKey = 'input', outputKey = 'output', otherKeys = []){
		const data = extract(this.data, otherKeys)
		for (const input of list){
			this.next(null, route, Object.assign({[inputKey]: input, [outputKey]: {}}, data))
		}
		return this.next()
	},

	branchOnce(route){
		return this.next(null, route + Date.now().toString(36))
	},

	onlyOnce(route, key = 'id'){
		let currentCode = 0
		let payloadId = 0
		return async function(payload){
			if (currentCode && currentCode !== this.params.code) return
			currentCode = this.params.code
			payloadId = payload[key]

			try {
				await this.next()
			} catch(ex){
				console.error(ex)
			} finally {
				currentCode = 0
				// no new payload exit recursive load
				if (payloadId === payload[key]) return
				this.next(null, route + Date.now().toString(36))
			}
		}
	},

	assert(error, id){
		return function(obj){
			if (!obj[id]) return this.next(error)
			return this.next()
		}
	},

	async wait(sec){
		await new Promise((resolve, reject) => {
			setTimeout(resolve, sec)
		})
		return this.next()
	},

	log(...args){
		console.log(...args)
		return this.next()
	},

	/**
	 * flatten deep nested structure
	 * @param {object} src - source object
	 * @param {object} map - {"filename": ["upload", "files", 0, "filename"]}
	 * @param {object} dst - destination
	 */
	flat(src, map, dst){
		const keys = Object.keys(map)
		keys.forEach(key => {
			dst[key] = pObj.dot(src, map[key])
		})
		return this.next()
	},

	push(item, array){
		array.push(item)
		return this.next()
	},

	assign(key, value, output){
		Object.assign(output, {[key]: value})
		return this.next()
	},

	value(key, object, output){
		Object.assign(output, object[key])
		return this.next()
	},

	dup(org, output){
		Object.assign(output, org)
		return this.next()
	},

	extract(arr, key, outputs){
		const list = arr.map(item => item[key])
		outputs.push(...list)
		return this.next()
	}
}
