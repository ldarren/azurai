const router=require('po/router')

return {
	deps: {
		ghSession: 'session',
		tpl: 'file'
	},
	create(deps){
		this.el.innerHTML = deps.tpl()
	},
	events:{
		'click a':function(evt, target){
			evt.preventDefault()
			this.deps.ghSession.authorize()
		}
	}
}
