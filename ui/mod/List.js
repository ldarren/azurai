function populate(self, coll, Row, params){
	const ids=Object.keys(coll.models)
	for(let i=0,l=ids.length,k; i<l; i++){
		k = ids[i]
		// TODO: how to pass model directly wo params
		self.spawn(Row,Object.assign({id: k}, params),[['model','model','coll','id']])
	}
}

return {
	deps:{
		coll:'models',
		Row:'view'
	},
	create:function(deps, params){
		deps.coll.callback.on('add',function(evt, coll, id){
			// eslint-disable-next-line
			console.log('Coll.add',evt, coll.get(id))
			this.spawn(deps.Row,Object.assign({id}, params),[['model','model','coll','id']])
		},this)
		deps.coll.callback.on('update',function(evt, coll, id){
			// eslint-disable-next-line
			console.log('Coll.update',evt, coll.get(id).params)
		},this)

		populate(this, deps.coll, deps.Row, params)
	},
	remove:function(){
		const coll=this.deps.coll
		coll.callback.off(null,null,this)
		this.super.remove.call(this)
	}
}
