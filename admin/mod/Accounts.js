var router=require('po/router')

return {
	deps: {
		ghSession: 'session',
		aud: 'list'
	},
	create(deps, params){
		const cred = deps.ghSession.get('cred')
		if (cred && cred.access_token){
			const bpayload = cred.access_token.split('.')[1]
			const payload = JSON.parse(atob(bpayload))
			deps.aud.push(...payload.aud.split(','))
		}
		this.super.create.call(this, deps, params)
	},
	slots:{
		click:function(from,sender,name){
			switch(name){
			case 'back':
				router.go('accounts')
				break
			}
		}
	}
}
