const router=require('po/router')

return {
	deps: {
		ghSession: 'session',
		aud: 'list',
		tpl: 'file'
	},
	create(deps){
		const access = {access: deps.aud.includes('github')}
		this.el.innerHTML = deps.tpl(access)
	},
	events:{
		'click a':function(evt, target){
			evt.preventDefault()
			if (this.deps.aud.includes('github')) return router.go('accounts/github')
			this.deps.ghSession.authorize()
		}
	}
}
