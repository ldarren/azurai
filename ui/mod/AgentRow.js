return {
	signals:['click'],
	deps:{
		tpl:'file',
		model:'model',
	},
	create:function(deps, params){
		if (!deps.model.s) return this.remove()
		const id = deps.model.id || 'new'
        this.el.dataset.id = id
		if (id === params.selected) this.el.classList.add('selected')
		this.el.innerHTML=deps.tpl(deps.model)
	},
	events: {
		'click a': function(evt, target){
            evt.preventDefault()
			this.signal.click('delete', this.deps.model.id).send(this.host)
		}
	}
}
