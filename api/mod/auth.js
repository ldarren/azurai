const path = require('node:path')
const pStr = require('pico-common').export('pico/str')
const pJWT = require('pico-jwt')

const iss = 'azurai'
let jwt
let ttl = 1000 * 60 * 30 // 30 min
let rttl = 1000 * 60 * 60 * 24 // 24 hours

module.exports = {
	setup(cfg){
		const root = path.resolve(__dirname, '../')
		jwt = new pJWT('RS256', path.resolve(root, cfg.pem), path.resolve(root, cfg.pub))
		ttl = cfg.ttl || ttl
		rttl = cfg.rttl || rttl
	},
	code(type, output){
		Object.assign(output, {
			type,
			code: pStr.rand()
		})
		return this.next()
	},
	readPayload(payload, ghuser, cred){
		const keys = Object.keys(payload)
		if (keys.includes('ghuser') && keys.includes('cred')){
			Object.assign(ghuser, payload['ghuser'])
			Object.assign(cred, payload['cred'])
			return this.next()
		}
		return this.next({status: 403})
	},
	async create(user, accounts, output){
console.log('>>>>>', accounts)
		const now = Date.now()
		const access_token = jwt.create({
			iss,
			sub: user.id,
			aud: accounts.map(a => a.type).join(','),
			exp: now + ttl,
			iat: now
		})
		Object.assign(output, {
			access_token,
			expiry: now + ttl,
			refresh_token: pStr.rand(),
			refresh_expiry: now + rttl
		})
		return this.next()
	},

	async validate(req, output){
		const auth = req.headers['authorization']
		const bearer = auth.split(' ')
		const payload = jwt.payload(bearer[1])
		if ('Bearer' === bearer[0] && payload.exp > Date.now() && !jwt.verify(bearer[1])) {
			return this.next({code: 403})
		}
		Object.assign(output, {
			id: payload.sub,
			role: payload.role
		})
		return this.next()
	},
}
