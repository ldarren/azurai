const Collection = inherit('po/Collection')
const router = require('po/router')

async function ajax(method, url, data, options){
	return new Promise((resolve, reject) => {
		pico.ajax(method, url, data, options, (err, state, resBody, xhr) => {
			if (4 !== state) return
			if (err) return reject(err)
			try {
				resolve(JSON.parse(resBody))
			}catch(ex){
				reject(ex)
			}
		})
	})
}

return {
	async init(env){
		this.client_id = env.GH_CLIENT_ID
		this.domain = env.DOMAIN
	},
	authorize(){
		const params = new URLSearchParams({
			scope: 'repo%20project',
		})
		window.location.href = this.domain + '/1/accounts/github/authorize?' + params.toString()
	},
	async signup(type, code){
		const {body} = await ajax('post', this.domain + '/1/accounts/signup', {type, code})
		console.log('>>>>', body)
		if (body.access_token) {
			// signin
			this.set(Object.assign({
				id: 'cred'
			}, body), true)
			router.go(`accounts/github`)
		}
	},
	async token(type, code){
		const {body} = await ajax('post', this.domain  + `/1/accounts/${type}/token`, {code})
		if (body.access_token) {
			// signin
			this.set(Object.assign({
				id: 'cred'
			}, body), true)
			router.go(`accounts/${type}`)
		} else if (body.code) {
			// ask for signup confirmation
			router.go(`accounts/${type}/confirm/${body.code}`)
		}
	},
}
