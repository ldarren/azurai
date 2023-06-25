const args = require('pico-args')
const picos = require('picos')

const opt = args.parse({
	service: ['service/index', 'path to service script'],
	s: '@service',
	mod: ['mod/', 'module path'],
	m: '@mod',
	ratelimit: [64, 'ratelimit'],
	r: '@ratelimit'
})
picos(opt, err => {
	if (err) throw err
})
