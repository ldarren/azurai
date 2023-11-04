var router=require('po/router')

return {
    deps: {
        agents: 'models'
    },
    create(deps, params){
        this.super.create.call(this, deps, params)
        this.selectedModel = deps.agents.get(params.selected === 'new' ? '' : params.selected)
    },
	slots:{
		click:function(from,sender,name){
			switch(name){
			case 'cancel':
				router.go('recruits')
				break
            case 'save':
                const form = this.el.querySelector('form')
                if (!form.reportValidity()) return // or .checkValidity
                const formData = new FormData(form)
                const formDataObject = Object.fromEntries(formData.entries())
        
                this.deps.agents.saveAgent(this.selectedModel.id, formDataObject)
                break
            }
		}
	}
}
