const Collection = inherit('po/Collection')
const router = require('po/router')

return {
	async init({session}){
        this._session = session
	},
    createAgent(){
        const agent = this.get('')
        if (agent) return
        this.set({
            id: '',
            name: '',
            summary: '',
            persona: '',
            params: {},
            s: 1
        })
    },
	async saveAgent(id){
        const agent = this.get(id)
		const {body} = await this._session.ajax('post', `/agents`, agent)
		this.set(body)
	}
}
