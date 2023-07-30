const router = require('po/router')

return {
	deps:{
		tpl:'file',
		model:'model'
	},
	create:function(deps){
		const data = deps.model
		this.el.innerHTML=deps.tpl(data)
	},
	events: {
		'click a': function(evt, target){
			evt.preventDefault()
		}
	}
}
