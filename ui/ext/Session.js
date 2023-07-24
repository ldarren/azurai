const Collection = inherit('po/Collection')
const router = require('po/router')

async function ajax(method, url, data, options){
	return new Promise((resolve, reject) => {
		pico.ajax(method, url, data, options, (err, state, resBody, xhr) => {
			if (4 !== state) return
			if (err) return reject(err)
			resolve(resBody)
		})
	})
}

return {
	async init(env){
		this.client_id = env.GH_CLIENT_ID
		const url = new URL(window.location.href)
		const code = url.searchParams.get('code')

		if (code){
			url.searchParams.delete('code')
			const newurl = url.href
			window.history.pushState({path:newurl}, '', newurl)

			const res = await ajax('post', env.DOMAIN + '/1/accounts/github/token', {code})
			console.log('>>>>', res)
		}
	},
	authorize(){
		const params = new URLSearchParams({
			scope: 'user:email',
			client_id: this.client_id
		})
		window.location.href = 'https://github.com/login/oauth/authorize?' + params.toString()
	},
	token(){

	}
}
