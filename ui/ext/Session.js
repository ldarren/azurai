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
		const url = new URL(window.location.href)
		const code = url.searchParams.get('code')

		if (code){
			url.searchParams.delete('code')
			const newurl = url.href
			window.history.pushState({path:newurl}, '', newurl)

			const {body} = await ajax('post', this.domain  + '/1/accounts/github/token', {code})
			console.log('>>>>', body)
			router.go(`accounts/github/confirm/${body.code}`)
		}
	},
	authorize(){
		const params = new URLSearchParams({
			scope: 'user:email',
			client_id: this.client_id
		})
		window.location.href = 'https://github.com/login/oauth/authorize?' + params.toString()
	},
	async signup(type, code){
		const {body} = await ajax('post', this.domain + '/1/accounts/signup', {type, code})
		console.log('>>>>', body)
		router.go(`accounts/github`)
	},
	token(){

	}
}
