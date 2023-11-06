pico.run({
	name: 'chores',
	ajax: __.ajax,
	onLoad: __.load,
	env: Object.assign(
		{ build: 'prod' },
		(function(el){
			return el && el.dataset ? el.dataset : {}
		})(document.getElementById('pEnv'))
	),
	preprocessors:{
		'.ejs':function(url,ejs){
			return pico.export('pico/str').template(ejs)
		}
	},
	baseurl: window.location.href,
	paths:{
		'~': './mod/',
		ext: './ext/',
		root: './',
		main: './main/',
		cfg: './cfg/',
		p: './lib/pico/',
		po: './lib/pojs/'
	}
},function(){
	var specMgr= require('p/specMgr')
	var View= require('p/View')
	var project = require('cfg/chores.json')
	var env = require('cfg/chores.env.json')
	var main

	return function(){
		specMgr.load(null, null, project, function(err, spec){
			if (err) return console.error(err)
			main = new View('_host', env, null, [])
			main.spawnBySpec(spec)
		})
	}
})
