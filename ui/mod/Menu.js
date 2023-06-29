function populate(self,coll,Row){
	const ids=Object.keys(coll.models)
	for(let i=0,k; (k=ids[i]); i++){
		// TODO: how to pass model directly wo params
		self.spawn(Row,{id: k},[['model','model','menuItems','id']])
	}
}

return {
	deps:{
		menuItems:'models',
		MenuItem:'view'
	},
	create:function(deps){
		deps.menuItems.callback.on('update',function(){
			// eslint-disable-next-line
			console.log('Coll.update',arguments)
		},this)
		deps.menuItems.models[1].callback.on('field.update',function(){
			// eslint-disable-next-line
			console.log('Model.update',arguments)
		},this)

		populate(this, deps.menuItems, deps.MenuItem)
	},
	remove:function(){
		const menuItems=this.deps.menuItems
		menuItems.models[1].callback.off(null,null,this)
		menuItems.callback.off(null,null,this)
		this.super.remove.call(this)
	}
}
