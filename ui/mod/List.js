function populate(self,coll,Row){
	const ids=Object.keys(coll.models)
	for(let i=0,k; (k=ids[i]); i++){
		// TODO: how to pass model directly wo params
		self.spawn(Row,{id: k},[['model','model','coll','id']])
	}
}

return {
	deps:{
		coll:'models',
		Row:'view'
	},
	create:function(deps){
		deps.coll.callback.on('add',function(evt, coll, id){
			// eslint-disable-next-line
			console.log('Coll.add',evt, coll.get(id))
			this.spawn(deps.Row,{id},[['model','model','coll','id']])
		},this)
		deps.coll.callback.on('update',function(){
			// eslint-disable-next-line
			console.log('Coll.update',arguments)
		},this)

		populate(this, deps.coll, deps.Row)
	},
	remove:function(){
		const coll=this.deps.coll
		coll.models[1].callback.off(null,null,this)
		coll.callback.off(null,null,this)
		this.super.remove.call(this)
	}
}
