return {
	deps:{
		tpl:'file',
		model:'model',
	},
	create:function(deps, params){
		const id = deps.model.id || 'new'
        this.el.dataset.id = id
		if (id === params.selected) this.el.classList.add('selected')
		this.el.innerHTML=deps.tpl(deps.model)
	},
}
