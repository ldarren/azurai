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
    return [
		files.length ? files.join() : 'No files',
		folders.length ? folders.join() : 'No subfolders'
	]
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
    createCodeFileSummary(tpl, params, outputs){
        outputs.push({
            role: 'system',
            content: replace(tpl.system, params)
        },{
            role: 'user',
            content: replace(tpl.user, params)
        })
        return this.next()
    },
    createCodeQuestions(tpl, params, outputs){
        outputs.push({
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
    queryPrompt(input, outputs){
        outputs.push({
            role: 'system',
            content: 'You are a helpful github repository assistant.'
        },{
            role: 'user',
            content: input.content
        })
        return this.next()
    },
    reorder(summaries, questions, outputs){
        const all = summaries.concat(questions)
        all.sort((a, b) => a.similarities - b.similarities)
        all.forEach(m => {
            if (outputs.includes(m.memory_id)) return
            outputs.push(m.memory_id)
        })
        return this.next()
    },
    functionCall(user, prompts, completion, options, output){
        const call = completion?.choices?.[0]?.function_call
        if (call) return this.next(null, `function\${call.name}`, Object.assign(this.data, {user, ":prompts": prompts, arguments: call, options, output}))
        Object.assign(output, completion)
        return this.next()
    },
    functionReply(memories, outputs){
        outputs.push({
            role: 'function',
            content: memories.join('\n\n')
        })
        return this.next()
    }
}
