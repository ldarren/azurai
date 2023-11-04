const router = require('po/router')

return {
	deps:{
		tpl:'file',
		model:'model',
		repo: 'models'
	},
	create:function(deps){
		const data = deps.model
		this.el.innerHTML=deps.tpl({
			id: data.id,
			node_id: data.node_id,
			full_name: data.full_name,
			checked: !!deps.repo.get(data.id)
		})
	},
	events: {
		'click input': function(evt, target){
			if (target.checked){
				this.deps.repo.set(this.deps.model)
			}else{
				this.deps.repo.remove(this.deps.model.id)
			}
		}
	}
}
