const router = require('po/router')

return {
	deps:{
		tpl:'file',
		model:'model'
	},
	create:function(deps){
		const data = deps.model
		this.el.href = '#' + data.link
		this.el.classList.add('bg-lite-'+data.bg)
		this.el.innerHTML=deps.tpl(data)
	},
	events: {
		'click a': function(evt, target){
			evt.preventDefault()
			router.go(target.href.split('#')[1])
		}
	}
}
