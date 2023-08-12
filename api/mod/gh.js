const qs = require('node:querystring')
const pUtil = require('picos-util')

const auth_headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'azurai/0.1.0'
}
const api_headers = {
	'Accept': 'application/vnd.github+json',
	'X-GitHub-Api-Version': '2022-11-28',
	'User-Agent': 'azurai/0.1.0'
}
let client_id = ''
let client_secret = ''

const ajax = (method, url, data, options) => {
	return new Promise((resolve, reject) => {
		pUtil.ajax(method, url, data, options, (err, state, text, res) => {
			if (4 !== state) return
			if (err) return reject({
				status: err.code,
				message: err.error
			})
			const ct = (res.headers['content-type'] || '').split(';')
			let body
			switch(ct[0]){
			case 'application/x-www-form-urlencoded':
				body = qs.parse(text)
				if (body.error)
					return reject({
						status: 400,
						message: body.error_description,
						params: body
					})
				return resolve(body)
			case 'application/json':
				body = JSON.parse(text)
				resolve(body)
				break
			}
			resolve(res)
		})
	})
}

module.exports = {
    setup(cfg){
        client_id = cfg.clientId
        client_secret = cfg.clientSecret
    },
    async authorize(query, output){
			const reqBody = {
				scope: query.scope,
				client_id
			}
			const res = await ajax('GET', 'https://github.com/login/oauth/authorize', reqBody, {headers: auth_headers, redirect:0})
			Object.assign(output, {
				status: res.statusCode,
				headers: res.headers
			})
			return this.next()
    },
    async token(input, output){
			const reqBody = Object.assign({}, input, {
				client_id,
				client_secret,
				accept: 'json'
			})
			const body = await ajax('GET', 'https://github.com/login/oauth/access_token', reqBody)
			if (!body) this.next({status: 400, message: err})
			Object.assign(output, body)
			return this.next()
    },
	async readUser(cred, output){
		const headers = Object.assign({
			'Authorization': 'Bearer ' + cred.access_token,
		}, api_headers)
		const body = await ajax('GET', 'https://api.github.com/user', null, {headers})
		if (!body) this.next({status: 400, message: err})
		Object.assign(output, body)
		return this.next()
	},
	async readRepos(cred, output){
		const headers = Object.assign({
			'Authorization': 'Bearer ' + cred.access_token,
		}, api_headers)
		const body = await ajax('GET', 'https://api.github.com/user/repos', null, {headers})
		if (!body) this.next({status: 400, message: err})
		Object.assign(output, body)
		return this.next()
	},
}
