module.exports = {
	async setup(){
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
        const choice = completion?.choices?.[0]
        prompts.push(choice?.message)
        if (choice && 'function_call' === choice.finish_reason) {
            const call = choice?.message?.function_call
            const arguments = JSON.parse(call?.arguments)
            return this.next(
                null,
                `function/${call.name}`,
                Object.assign({}, this.data, {
                    user,
                    ':prompts': prompts,
                    arguments,
                    options,
                    output
                })
            )
        }
        Object.assign(output, completion)
        return this.next()
    },
    functionReply(name){
        return function(memories, outputs){
            const content = memories.reduce((acc, m) => {
                acc += JSON.stringify(m) + '\n\n'
                return acc
            }, '')
            outputs.push({
                role: 'function',
                name,
                content,
            })
            return this.next()
        }
    }
}
