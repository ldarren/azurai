const router=require('po/router')

return {
	deps: {
		env: 'map',
		tpl: 'file'
	},
	create(deps){
	console.log('>>>', deps.env)
		this.el.innerHTML = deps.tpl(deps.env)
	},
	slots:{
		click:function(from,sender,name){
			switch(name){
			case 'back':
				router.go('organizations')
				break
			}
		}
	}
}
