const router = require('po/router')

return{
	deps:{
		tpl:['file','<button type="button">Confirm</button>'],
		ghSession: 'session'
	},
	create: function(deps, params){
		this._type = params.type
		this._code = params.code
		this.el.innerHTML=deps.tpl(params)
	},
	events: {
		'click button[type=submit]': function(evt, target){
			evt.preventDefault()
			console.log("confirm")
			this.deps.ghSession.signup(this._type , this._code)
		},
		'click button[type=reset]': function(evt, target){
			evt.preventDefault()
			router.go(`accounts`)
		}
	}
}
