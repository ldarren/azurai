const path = require('node:path')

const replace = (tpl, obj) => {
	let ret = tpl
	for (const key in obj){
		ret = ret.replaceAll(`{${key}}`, obj[key])
	}
	return ret
}

const listChunks = (memories, chunks) => {
    const files = []
    const folders = []
    const map = {}
    for (const m of memories){
        map[m.id] = {
            name: m.name,
            type: m.type
        }
    }
    for (const c of chunks){
        const m = map[c.memory_id]
        if (!m) continue
        m.summary = c.chunk
    }
    for (const key in map) {
        const m = map[key]
        if ('tree' === m.type){
            folders.push(`\nName: ${m.name}\nSummary: ${m.summary}\n\n`)
        }else{
            files.push(`\nName: ${m.name}\nSummary: ${m.summary}\n\n`)
        }
    }
    return [files, folders]
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
    folderSummaryPrompt(tpl, params, memories, chunks, outputs){
        const [fileList, folderList] = listChunks(memories, chunks)
        outputs.push({
            role: 'system',
            content: replace(tpl.system, params)
        },{
            role: 'user',
            content: replace(tpl.user, params).replace('{listFiles}', fileList).replace('{listFolders}', folderList)
        })
        return this.next()
    },
}
