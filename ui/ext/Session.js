const Collection = inherit('po/Collection')
const router = require('po/router')

async function ajax(method, url, data, options){
    return new Promise((resolve, reject) => {
        pico.ajax(method, url, data, options, (err, state, resBody, xhr) => {
            if (4 !== state) return
            if (err) return reject(err)
            resolve(resBody)
        })
    })
}

return {
    init(env){
        this.client_id = env.GH_CLIENT_ID
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        if (code){
            const urlObj = new URL(url)
            urlObj.search = ''
            router.go(urlObj.toString())
        }
    },
    authorize(){
        const params = new URLSearchParams({
            scope: 'user:email',
            client_id: this.client_id
        })
        console.log(params.toString());
        window.location.href = 'https://github.com/login/oauth/authorize?' + params.toString()
    },
    token(){

    }
}
