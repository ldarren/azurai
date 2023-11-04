const router=require('po/router')

return {
	deps: {
		ghSession: 'session',
		tpl: 'file'
	},
	create(deps, params){
		const url = new URL(window.location.href)
		const code = url.searchParams.get('code')

		if (code){
			url.searchParams.delete('code')
			const newurl = url.href
			window.history.pushState({path:newurl}, '', newurl)

			this.deps.ghSession.token(params.type, code)
		}

		this.el.innerHTML = deps.tpl({message: 'AuthCode'})
	},
}
