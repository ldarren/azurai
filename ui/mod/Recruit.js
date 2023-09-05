var router=require('po/router')

return {
    deps: {
        agents: 'models'
    },
	create(deps, params){
		this._selected = params.selected
		this.super.create.call(this, deps, params)
	},
	slots:{
		click:function(from,sender,name,id){
			switch(name){
			case 'back':
				router.go('accounts')
				break
            case 'add':
                this.deps.agents.createAgent()
                break
			case 'delete':
				this.deps.agents.deleteAgent(id)
				break
			}
		}
	},
	events:{
		'click li': function(evt, target){
			evt.preventDefault()
			console.log(target)
			const id = target.dataset.id
			if (this._selected === id) return
			router.go(`recruits/${id}`)
		}
	}
}
