const qs = require('node:querystring')
const pico = require('pico-common')

const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'azurai/0.1.0'
}
let client_id = ''
let client_secret = ''

const ajax = (method, url, data, options) => {
	return new Promise((resolve, reject) => {
		pico.ajax(method, url, data, options, (err, state, body, res) => {
			if (4 !== state) return
			if (err) return reject(err)
			resolve([res, body])
		})
	})
}

module.exports = {
    setup(cfg){
        client_id = cfg.clientId
        client_secret = cfg.clientSecret
    },
    async authorize(output){
		const reqBody = {
			scope: 'user:email',
			client_id
		}
		const [res] = await ajax('GET', 'https://github.com/login/oauth/authorize', reqBody, {headers, redirect:0})
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
		const [res, body] = await ajax('GET', 'https://github.com/login/oauth/access_token', reqBody)
		if (200 !== res.statusCode) return this.next({status:400})
		const ct = (res.headers['content-type'] || '').split(';')
		if(ct[0] === 'application/x-www-form-urlencoded'){
			const err = qs.parse(body)
			return this.next({status: 400, message: err})
		}
		const obj = JSON.parse(body)
		Object.assign(output, obj)
		return this.next()
    }
}