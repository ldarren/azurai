const Collection = inherit('po/Collection')
const router = require('po/router')

function refresh(evt, coll, id){
	if (id === 'cred') this.listAgents()
}

return {
	init({session}){
        this._session = session
	},
    ready(){
        if (this._session.get('cred')){
			this.listAgents()
        }else{
			this._session.callback.on('add', refresh, this)
        }
    },
	fini(){
		this._session.callback.off('add', refresh, this)
	},
    async listAgents(){
		const {body} = await this._session.ajax('get', `/1/agents`)
		this.set(body)
		console.log('agents>list', body)
    },
    createAgent(){
        const agent = this.get('')
        if (agent) return
        this.set({
            id: '',
            name: '',
            summary: '',
            persona: 'give comprehensive github md answer',
            params: {
                "model": "gpt-3.5-turbo-16k-0613",
                "temperature": 1,
                "top_p": 1,
                "n": 1,
                "stream": false,
                "max_tokens": 1024,
                "presence_penalty":  0,
                "frequency_penalty":  0
            },
            s: 1
        })
    },
	async saveAgent(id, obj){
        if (!!id && id !== obj.id) return
        const curr = this.get(id)
        if (!curr) return
        let body
        if (id){
            ({body} = await this._session.ajax('put', `/1/agents/${id}`, obj))
			console.log('agents>update', body)
        }else{
            ({body} = await this._session.ajax('post', `/1/agents`, obj))
			console.log('agents>insert', body)
        }
        Object.assign(curr, body)
	},
    async deleteAgent(id){
        const curr = this.get(id)
        if (!curr) return
        if (id) {
            const {body} = await this._session.ajax('delete', `/1/agents/${id}`, curr)
            console.log('agents>delete', body)
            Object.assign(curr, body)
        }else{
            curr.s = 0
        }
    }
}
