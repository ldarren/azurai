const Collection = inherit('po/Collection')
const router = require('po/router')

return {
    cache: null,
	async init({session}){
        this._session = session
	},
	async retrieveRepositories(){
		const {body} = await this._session.ajax('get', `/repos`)
		this.set(body, true)
	}
}
