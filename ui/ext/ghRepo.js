const Collection = inherit('po/Collection')
const router = require('po/router')

async function ajax(method, url, data, options){
	return new Promise((resolve, reject) => {
		pico.ajax(method, url, data, options, (err, state, resBody, xhr) => {
			if (4 !== state) return
			if (err) return reject(err)
			try {
				resolve(JSON.parse(resBody))
			}catch(ex){
				reject(ex)
			}
		})
	})
}

return {
	async init({session}){
        this._session = session
	},
	async retrieveRepositories(){
		const {body} = await this._session.ajax('get', `/repositories`)
		// signin
		this.set(Object.assign({
			id: 'repo'
		}, body), true)
	}
}
