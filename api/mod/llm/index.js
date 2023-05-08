const { Configuration, OpenAIApi } = require('openai')
//const prompt_prefix = require('./prompt_prefix.txt')
//const query_prompt_template = require('./query_prompt_template.txt')
//const follow_up_questions_prompt_content = require('./follow_up_questions_prompt_content.txt')

function convertHistory2Messages(history, approx_max_tokens=1000) {
    const messages = [{role: 'system', content: 'if not mentioned otherwise, all output format should be in html'}]
    history.forEach(h => {
        if (h['user']) messages.push({
            role: 'user',
            content: h['user']
        })
        if (h['bot']) messages.push({
            role: 'assistant',
            content: h['bot']
        })
    })
    let tokenCount = approx_max_tokens * 4
    const index = messages.findLastIndex(m => {
        tokenCount -= m.content.length
        return tokenCount <= 0
    })

    return -1 === index ? messages : messages.slice(index)
}

function LLM({model, apiKey}){
    this.model = model
    const configuration = new Configuration({
        apiKey,
    })
    this.openai = new OpenAIApi(configuration)
}

LLM.prototype = {
    async simpleChat(history, overrides = {}){
console.log('#### chat:req ######', JSON.stringify(history))
        const use_semantic_captions = !!overrides['semantic_captions']
        const top = overrides['top'] || 3
        const exclude_category = overrides['exclude_category']
        const filter = exclude_category ? `category ne '${exclude_category.replace("'", "''")}'` : null;
        
        // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
        const res = await this.openai.createChatCompletion({
            model: this.model,
            messages: convertHistory2Messages(history),
            temperature: 0.3,
            max_tokens: 512,
            n: 1,
            // stop: ['\n']
        })
        const completion = res.data
console.log('#### chat:res.data ######', JSON.stringify(res.data))
        
        return {usage: res.usage, data_points: '', answer: completion.choices[0].message.content, thoughts: "Searched for:<br>{q}<br><br>Prompt:<br>"}
     },
     async simpleAsk(prompt, overrides = {}){
        console.log('#### ask:req ######', JSON.stringify(prompt))
                const use_semantic_captions = !!overrides['semantic_captions']
                const top = overrides['top'] || 3
                const exclude_category = overrides['exclude_category']
                const filter = exclude_category ? `category ne '${exclude_category.replace("'", "''")}'` : null;
                
                // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
                const res = await this.openai.createCompletion({
                    model: 'text-davinci-003',
                    prompt,
                    temperature: 0.3,
                    max_tokens: 512,
                    n: 1,
                    // stop: ['\n']
                })
                const completion = res.data
        console.log('#### ask:res.data ######', JSON.stringify(res.data))
                
                return {usage: res.usage, data_points: '', answer: completion.choices[0].text, thoughts: "Searched for:<br>{q}<br><br>Prompt:<br>"}
             }
        }

module.exports = {
    setup(host, cfg, rsc, paths){      
		return new LLM(cfg)
	},
    async chat(llm, history, overrides, output){
        const completion = await llm.simpleChat(history, overrides)
        Object.assign(output, completion)
        return this.next()
    },
    async ask(llm, question, overrides, output){
        const completion = await llm.simpleAsk(question, overrides)
        Object.assign(output, completion)
        return this.next()
    }
}