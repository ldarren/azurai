const path = require('node:path')

const replace = (tpl, obj) => {
console.log('>>>', tpl, obj)
	let ret = tpl
	for (const key in obj){
		ret = ret.replaceAll(`{${key}}`, obj[key])
	}
	return ret
}

const listFiles = (files) => {
    files.map((file) => {
        return `
        Name: ${file.fileName}
        Summary: ${file.summary}    
    
        `;
    })
}

const listFolders = (folders) => {
    folders.map((folder) => {
        return `
        Name: ${folder.folderName}
        Summary: ${folder.summary}    
    
        `;
    })
}

module.exports = {
	async setup(){
    },
    createMemoryProjFromParams(params, body, output){
        Object.assign(output, {
            agent_id: '',
			targetAudience: 'smart developer',
            contentType: 'code',
            projectName: path.join(params.user, params.repo),
        }, body)
        return this.next()
    },
    /*
    contentType
    projectName
    path
    text
    */
    createCodeFileSummary(tpl, params, output){
        output.push({
            role: 'system',
            content: replace(tpl.system, params)
        },{
            role: 'user',
            content: replace(tpl.user, params)
        })
        return this.next()
    },
    createCodeQuestions(tpl, params, output){
        output.push({
            role: 'user',
            content: replace(tpl.user, params)
        })
        return this.next()
    },
    folderSummaryPrompt(tpl, params, output){
        output.push({
            role: 'system',
            content: replace(tpl.system, params)
        },{
            role: 'user',
            content: replace(tpl.user, params)
        })
        return this.next()
    },
}