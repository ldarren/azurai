const pStr = require('pico-common').export('pico/string')
const pJWT = require('pico-jwt')

let jwt
let ttl = 1000 * 60 * 30 // 30 min
let rttl = 1000 * 60 * 60 * 24 // 24 hours

module.exports = {
	setup(cfg){
		jwt = new pJWT('RS256', cfg.pem, cfg.pub)
		ttl = cfg.ttl || ttl
		rttl = cfg.rttl || rttl
	},
	code(type, output){
		Object.assign(output, {
			type,
			code: pStr.random()
		})
		return this.next()
	},
	async create(user, output){
		const now = Date.now()
		const access_token = jwt.create({
			iss: 'azurai',
			sub: user.id,
			aud: user.role,
			exp: now + ttl,
			iat: now
		})
		Object.assign(output, {
			access_token,
			expiry: now + ttl,
			refresh_token: pstr.random(),
			refresh_expiry: now + rttl
		})
		return this.next()
	},

	async validate(req, output){
		const auth = req.headers['authorization']
		const bearer = auth.split(' ')
		if ('Bearer' === bearer[0] && !jwt.verify(bearer[1])) {
			return this.next({code: 403})
		}
		const payload = jwt.payload(bearer[1])
		Object.assign(output, {
			id: payload.sub,
			role: payload.role
		})
		return this.next()
	},
}
