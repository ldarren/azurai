var router=require('po/router')

return {
    deps: {
        agents: 'models'
    },
	slots:{
		click:function(from,sender,name){
			switch(name){
			case 'back':
				router.go('accounts')
				break
            case 'add':
                this.deps.agents.createAgent()
                break
            }
		}
	},
	events:{
		'click li': function(evt, target){
			console.log(target)
			const id = target.dataset.id
			router.go(`recruits/${id}`)
		}
	}
}
